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


// FormControl sends through type=undefined, so remove it from props
const TextControl = ({ tenancy: _, type, ...props }) => (
    <FormControl type="text" {...props} />
);

const NumberControl = ({ tenancy: _, type, ...props }) => (
    <FormControl type="number" {...props} />
);

const IntegerControl = ({ tenancy: _, type, ...props }) => (
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

const CloudClusterControl = ({ tenancy, tag, ...props }) => (
    <ClusterSelectControl
      resource={tenancy.clusters}
      resourceFilter={(c) => !tag || c.tags.includes(tag)}
      {...props} />
);


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
          name={parameter.name}
          label={parameter.label}
          helpText={<ReactMarkdown source={parameter.description} />}>
            <Control
              tenancy={tenancy}
              required={parameter.required}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={parameter.immutable && !isCreate}
              {...parameter.options} />
        </Field>
    );
};
