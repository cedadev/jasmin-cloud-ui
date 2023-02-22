/**
 * This module contains utilities for generating forms for cluster parameters.
 */

import React from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

import ReactMarkdown from 'react-markdown';

import get from 'lodash/get';

import {
    SizeSelectControl,
    ExternalIpSelectControl,
    VolumeSelectControl,
    MachineSelectControl,
    ClusterSelectControl
} from './resource-utils';

import { HorizFormGroupContainer } from '../../utils';

class FormControlWithCustomValidity extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = null;
    }

    setCustomValidity = () => (
        this.inputRef
            && this.inputRef.setCustomValidity(this.props.customValidity || '')
    )

    componentDidMount = () => this.setCustomValidity()

    componentDidUpdate = () => this.setCustomValidity()

    render() {
        const { customValidity: _, ...props } = this.props;
        return <Form.Control {...props} ref={(ref) => { this.inputRef = ref; }} />;
    }
}

class TextControl extends React.Component {
    state = { confirmation: '' }

    componentDidMount = () => this.setState({ confirmation: this.props.value })

    render() {
        const {
            tenancy: _,
            tenancyActions: __,
            secret,
            confirm,
            min_length: minLength,
            max_length: maxLength,
            ...props
        } = this.props;
        const inputType = secret ? 'password' : 'text';
        const customValidity = (
            props.value !== this.state.confirmation
                ? 'Confirmation does not match.'
                : ''
        );
        return (
            <>
                <Form.Control
                    {...props}
                    minLength={minLength}
                    maxLength={maxLength}
                    type={inputType}
                    onChange={(e) => this.props.onChange(e.target.value)}
                />
                {confirm && (
                    <FormControlWithCustomValidity
                        {...props}
                        id={`${props.id}-confirm`}
                        placeholder={`Confirm ${props.placeholder}`}
                        type={inputType}
                        value={this.state.confirmation}
                        onChange={(e) => this.setState({ confirmation: e.target.value })}
                        customValidity={customValidity}
                    />
                )}
            </>
        );
    }
}

const NumberControl = ({ tenancy: _, tenancyActions: __, ...props }) => (
    <Form.Control
        {...props}
        type="number"
        onChange={(e) => props.onChange(e.target.value)}
    />
);

const IntegerControl = (props) => (
    <NumberControl step="1" {...props} />
);

const ChoiceControl = ({
    tenancy: _, tenancyActions: __, choices, ...props
}) => (
    <Form.Select
        // componentClass={RichSelect}
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
    >
        <option value="">Select one...</option>
        {choices.map((c) => <option key={c}>{c}</option>)}
    </Form.Select>
);

class ListControl extends React.Component {
    // On first mount, pad the value to the minimum length if required
    componentDidMount = () => {
        const minLength = this.props.min_length || 0;
        const values = this.props.value || [];
        const padding = Array(Math.max(minLength - values.length, 0)).fill('');
        this.props.onChange(values.concat(padding));
    }

    itemAdded = () => {
        this.props.onChange([...this.props.value || [], '']);
    }

    itemChanged = (index) => (value) => {
        const currentList = this.props.value || [];
        this.props.onChange([
            ...currentList.slice(0, index),
            value,
            ...currentList.slice(index + 1)
        ]);
    }

    itemRemoved = (index) => () => {
        const currentList = this.props.value || [];
        this.props.onChange([
            ...currentList.slice(0, index),
            ...currentList.slice(index + 1)
        ]);
    }

    render() {
        const {
            tenancy,
            tenancyActions,
            min_length: minLength = 0,
            max_length: maxLength,
            item = { kind: 'string', options: {} },
            id,
            value,
            disabled
        } = this.props;
        // Select the item control based on the item kind
        const ItemControl = get(kindToControlMap, item.kind, TextControl);
        return (
            <>
                {(value || []).map((v, i) => (
                    <InputGroup key={i}>
                        <ItemControl
                            id={`${id}[${i}]`}
                            tenancy={tenancy}
                            tenancyActions={tenancyActions}
                            required
                            value={v}
                            onChange={this.itemChanged(i)}
                            disabled={disabled}
                            {...item.options}
                        />
                        <Button
                            title="Remove item"
                            className="form-list-item-remove"
                            disabled={disabled || (value.length <= minLength)}
                            onClick={this.itemRemoved(i)}
                        >
                            <i className="fas fa-times" />
                        </Button>
                    </InputGroup>
                ))}
                <Button
                    variant="success"
                    disabled={disabled || (maxLength && value.length >= maxLength)}
                    onClick={this.itemAdded}
                    className="mt-1"
                >
                    <i className="fas fa-fw fa-plus" />
                    {'\u00A0'}
                    Add another item
                </Button>
            </>
        );
    }
}

const CloudSizeControl = ({
    tenancy, tenancyActions: __, min_cpus, min_ram, min_disk, ...props
}) => {
    const filterSizes = (size) => {
        if (!!min_cpus && size.cpus < min_cpus) return false;
        if (!!min_ram && size.ram < min_ram) return false;
        if (!!min_disk && size.disk < min_disk) return false;
        return true;
    };
    return (
        <SizeSelectControl
            resource={tenancy.sizes}
            resourceFilter={filterSizes}
            {...props}
            onChange={(value) => props.onChange(value)}
        />
    );
};

const CloudMachineControl = ({ tenancy, tenancyActions: __, ...props }) => (
    <MachineSelectControl
        resource={tenancy.machines}
        {...props}
        onChange={(value) => props.onChange(value)}
    />
);

const CloudIpControl = ({ tenancy, tenancyActions, ...props }) => (
    <ExternalIpSelectControl
        resource={tenancy.externalIps}
        resourceActions={tenancyActions.externalIp}
        {...props}
        onChange={(value) => props.onChange(value)}
    />
);

const CloudVolumeControl = ({
    tenancy, tenancyActions: __, min_size, ...props
}) => (
    <VolumeSelectControl
        resource={tenancy.volumes}
        resourceFilter={(v) => (!min_size || v.size >= min_size)}
        {...props}
        onChange={(value) => props.onChange(value)}
    />
);

const CloudClusterControl = ({
    tenancy, tenancyActions: __, tag, value, ...props
}) => {
    const hasTag = (c) => !tag || c.tags.includes(tag);
    const isReady = (c) => (value === c.name) || (c.status === 'READY');
    const resourceToOption = (c) => (
        {
            value: c.name,
            key: c.name,
            title: c.name,
        }
    );
    return (
        <ClusterSelectControl
            resource={tenancy.clusters}
            resourceFilter={(c) => hasTag(c) && isReady(c)}
            // We work in names for clusters
            resourceToOption={resourceToOption}
            value={value}
            {...props}
            onChange={(value) => props.onChange(value)}
        />
    );
};

const kindToControlMap = {
    integer: IntegerControl,
    number: NumberControl,
    choice: ChoiceControl,
    list: ListControl,
    'cloud.size': CloudSizeControl,
    'cloud.machine': CloudMachineControl,
    'cloud.ip': CloudIpControl,
    'cloud.volume': CloudVolumeControl,
    'cloud.cluster': CloudClusterControl,
};

const BooleanParameterField = (props) => {
    const {
        parameter, value, onChange, isCreate
    } = props;
    return (
        <HorizFormGroupContainer
            label={parameter.label}
            labelWidth={3}
            helpText={<ReactMarkdown source={parameter.description} />}
        >
            <InputGroup.Checkbox
                id={parameter.name}
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                disabled={parameter.immutable && !isCreate}
            >
                {parameter.options.checkboxLabel || parameter.label}
            </InputGroup.Checkbox>
        </HorizFormGroupContainer>
    );
};

const DefaultParameterField = (props) => {
    const {
        tenancy,
        tenancyActions,
        parameter,
        value,
        onChange,
        isCreate,
    } = props;
    const Control = get(kindToControlMap, parameter.kind, TextControl);
    return (
        <HorizFormGroupContainer
            label={parameter.label}
            labelWidth={3}
            required={parameter.required}
            helpText={<ReactMarkdown source={parameter.description} />}
        >
            <Control
                id={parameter.name}
                tenancy={tenancy}
                tenancyActions={tenancyActions}
                required={parameter.required}
                value={value}
                onChange={onChange}
                disabled={parameter.immutable && !isCreate}
                placeholder={parameter.label}
                {...parameter.options}
            />
        </HorizFormGroupContainer>
    );
};

export const ClusterParameterField = (props) => (props.parameter.kind === 'boolean'
    ? <BooleanParameterField {...props} />
    : <DefaultParameterField {...props} />);
