/**
 * This module contains utilities for generating forms for cluster parameters.
 */

import React from 'react';
import { FormControl } from 'react-bootstrap';

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

    render() {
        const { tenancy: _, secret, confirm, ...props } = this.props;
        const inputType = secret ? "password" : "text";
        const customValidity = (
            props.value !== this.state.confirmation ?
                'Confirmation does not match.' :
                ''
        );
        return (
            <>
                <FormControl {...props} type={inputType} />
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

const NumberControl = ({ tenancy: _, ...props }) => (
    <FormControl {...props} type="number" />
);

const IntegerControl = ({ tenancy: _, ...props }) => (
    <NumberControl step="1" {...props} />
);

const ChoiceControl = ({ tenancy: _, choices, ...props }) => (
    <FormControl componentClass={RichSelect} {...props}>
        <option value="">Select one...</option>
        {choices.map(c => <option key={c}>{c}</option>)}
    </FormControl>
);

const CloudSizeControl = ({ tenancy, min_cpus, min_ram, ...props }) => {
    const filterSizes = (size) => {
        if( !!min_cpus && size.cpus < min_cpus ) return false;
        if( !!min_ram && size.ram < min_ram ) return false;
        return true;
    };
    return (
        <SizeSelectControl
          resource={tenancy.sizes}
          resourceFilter={filterSizes}
          {...props} />
    );
};

const CloudMachineControl = ({ tenancy, ...props }) => (
    <MachineSelectControl resource={tenancy.machines} {...props} />
);

const CloudIpControl = ({ tenancy, ...props }) => (
    <ExternalIpSelectControl resource={tenancy.externalIps} {...props} />
);

const CloudVolumeControl = ({ tenancy, min_size, ...props }) => (
    <VolumeSelectControl
      resource={tenancy.volumes}
      resourceFilter={(v) => (!min_size || v.size >= min_size)}
      {...props} />
);

const CloudClusterControl = ({ tenancy, tag, value, ...props }) => {
    const hasTag = (c) => !tag || c.tags.includes(tag);
    const isReady = (c) => (value === c.name) || (c.status === 'READY');
    return (
        <ClusterSelectControl
          resource={tenancy.clusters}
          resourceFilter={(c) => hasTag(c) && isReady(c)}
          // We work in names for clusters
          resourceToOption={(c) => <option key={c.name} value={c.name}>{c.name}</option>}
          value={value}
          {...props} />
    );
};


const kindToControlMap = {
    'integer': IntegerControl,
    'number': NumberControl,
    'choice': ChoiceControl,
    'cloud.size': CloudSizeControl,
    'cloud.machine': CloudMachineControl,
    'cloud.ip': CloudIpControl,
    'cloud.volume': CloudVolumeControl,
    'cloud.cluster': CloudClusterControl,
};


export const ClusterParameterField = (props) => {
    const { tenancy, parameter, value, onChange, isCreate } = props;
    const Control = get(kindToControlMap, parameter.kind, TextControl);
    return (
        <Field
          label={parameter.label}
          helpText={<ReactMarkdown source={parameter.description} />}>
            <Control
              id={parameter.name}
              tenancy={tenancy}
              required={parameter.required}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={parameter.immutable && !isCreate}
              placeholder={parameter.label}
              {...parameter.options} />
        </Field>
    );
};
