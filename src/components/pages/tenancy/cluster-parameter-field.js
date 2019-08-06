/**
 * This module contains utilities for generating forms for cluster parameters.
 */

import React from 'react';
import { FormControl, Checkbox, Button, InputGroup } from 'react-bootstrap';

import ReactMarkdown from 'react-markdown';

import get from 'lodash/get';

import {
    SizeSelectControl,
    ExternalIpSelectControl,
    VolumeSelectControl,
    MachineSelectControl,
    ClusterSelectControl
} from './resource-utils';
import { Field, RichSelect } from '../../utils';


class FormControlWithCustomValidity extends React.Component {
    constructor(props) {
        super(props)
        this.inputRef = null;
    }

    setCustomValidity = () => (
        this.inputRef &&
            this.inputRef.setCustomValidity(this.props.customValidity || '')
    )
    componentDidMount = () => this.setCustomValidity()
    componentDidUpdate = () => this.setCustomValidity()

    render() {
        const { customValidity: _, ...props } = this.props;
        return <FormControl {...props} inputRef={ref => { this.inputRef = ref; }} />;
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
            ...props
        } = this.props;
        const inputType = secret ? "password" : "text";
        const customValidity = (
            props.value !== this.state.confirmation ?
                'Confirmation does not match.' :
                ''
        );
        return (
            <>
                <FormControl
                  {...props}
                  type={inputType}
                  onChange={(e) => this.props.onChange(e.target.value)} />
                {confirm && (
                    <FormControlWithCustomValidity
                      {...props}
                      id={`${props.id}-confirm`}
                      placeholder={`Confirm ${props.placeholder}`}
                      type={inputType}
                      value={this.state.confirmation}
                      onChange={(e) => this.setState({ confirmation: e.target.value })}
                      customValidity={customValidity} />
                )}
            </>
        );
    }
}

const NumberControl = ({ tenancy: _, tenancyActions: __, ...props }) => (
    <FormControl
      {...props}
      type="number"
      onChange={(e) => props.onChange(e.target.value)} />
);

const IntegerControl = (props) => (
    <NumberControl step="1" {...props} />
);

const ChoiceControl = ({ tenancy: _, tenancyActions: __, choices, ...props }) => (
    <FormControl
      componentClass={RichSelect}
      {...props}
      onChange={(e) => props.onChange(e.target.value)}>
        <option value="">Select one...</option>
        {choices.map(c => <option key={c}>{c}</option>)}
    </FormControl>
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
        this.props.onChange([...this.props.value || [], ''])
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
            max_length: maxLength = 5,
            item = {kind: "string", options: {}},
            id,
            value,
            disabled
        } = this.props;
        // Select the item control based on the item kind
        const ItemControl = get(kindToControlMap, item.kind, TextControl);
        return (
            <>
                {(value || []).map((v, i) => (
                    <div key={i} className="form-list-item">
                        <div className="form-list-item-control">
                            <ItemControl
                              id={`${id}[${i}]`}
                              tenancy={tenancy}
                              tenancyActions={tenancyActions}
                              required={true}
                              value={v}
                              onChange={this.itemChanged(i)}
                              disabled={disabled}
                              {...item.options} />
                        </div>
                        <Button
                          title="Remove item"
                          className="form-list-item-remove"
                          disabled={disabled || (value.length <= minLength)}
                          onClick={this.itemRemoved(i)}>
                            <i className="fa fa-times" />
                        </Button>
                    </div>
                ))}
                <Button
                  bsStyle="success"
                  disabled={disabled || (maxLength && value.length >= maxLength)}
                  onClick={this.itemAdded}>
                    <i className="fa fa-fw fa-plus" />
                    {'\u00A0'}
                    Add another item
                </Button>
            </>
        );
    }
}

const CloudSizeControl = ({ tenancy, tenancyActions: __, min_cpus, min_ram, min_disk, ...props }) => {
    const filterSizes = (size) => {
        if( !!min_cpus && size.cpus < min_cpus ) return false;
        if( !!min_ram && size.ram < min_ram ) return false;
        if( !!min_disk && size.disk < min_disk ) return false;
        return true;
    };
    return (
        <SizeSelectControl
          resource={tenancy.sizes}
          resourceFilter={filterSizes}
          {...props}
          onChange={(e) => props.onChange(e.target.value)} />
    );
};

const CloudMachineControl = ({ tenancy, tenancyActions: __, ...props }) => (
    <MachineSelectControl
      resource={tenancy.machines}
      {...props}
      onChange={(e) => props.onChange(e.target.value)} />
);

const CloudIpControl = ({ tenancy, tenancyActions, ...props }) => (
    <ExternalIpSelectControl
      resource={tenancy.externalIps}
      resourceActions={tenancyActions.externalIp}
      {...props}
      onChange={(e) => props.onChange(e.target.value)} />
);

const CloudVolumeControl = ({ tenancy, tenancyActions: __, min_size, ...props }) => (
    <VolumeSelectControl
      resource={tenancy.volumes}
      resourceFilter={(v) => (!min_size || v.size >= min_size)}
      {...props}
      onChange={(e) => props.onChange(e.target.value)} />
);

const CloudClusterControl = ({ tenancy, tenancyActions: __, tag, value, ...props }) => {
    const hasTag = (c) => !tag || c.tags.includes(tag);
    const isReady = (c) => (value === c.name) || (c.status === 'READY');
    return (
        <ClusterSelectControl
          resource={tenancy.clusters}
          resourceFilter={(c) => hasTag(c) && isReady(c)}
          // We work in names for clusters
          resourceToOption={(c) => <option key={c.name} value={c.name}>{c.name}</option>}
          value={value}
          {...props}
          onChange={(e) => props.onChange(e.target.value)} />
    );
};


const kindToControlMap = {
    'integer': IntegerControl,
    'number': NumberControl,
    'choice': ChoiceControl,
    'list': ListControl,
    'cloud.size': CloudSizeControl,
    'cloud.machine': CloudMachineControl,
    'cloud.ip': CloudIpControl,
    'cloud.volume': CloudVolumeControl,
    'cloud.cluster': CloudClusterControl,
};


const BooleanParameterField = (props) => {
    const { parameter, value, onChange, isCreate } = props;
    return (
        <Field
          label={parameter.label}
          helpText={<ReactMarkdown source={parameter.description} />}>
            <Checkbox
              id={parameter.name}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={parameter.immutable && !isCreate}>
                {parameter.options.checkboxLabel || parameter.label}
            </Checkbox>
        </Field>
    );
};


const DefaultParameterField = (props) => {
    const { tenancy, tenancyActions, parameter, value, onChange, isCreate } = props;
    const Control = get(kindToControlMap, parameter.kind, TextControl);
    return (
        <Field
          label={parameter.label}
          required={parameter.required}
          helpText={<ReactMarkdown source={parameter.description} />}>
            <Control
              id={parameter.name}
              tenancy={tenancy}
              tenancyActions={tenancyActions}
              required={parameter.required}
              value={value}
              onChange={onChange}
              disabled={parameter.immutable && !isCreate}
              placeholder={parameter.label}
              {...parameter.options} />
        </Field>
    );
};


export const ClusterParameterField = (props) => {
    return props.parameter.kind == "boolean" ?
        <BooleanParameterField {...props} /> :
        <DefaultParameterField {...props} />;
};
