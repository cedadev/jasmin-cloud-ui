/**
 * This module contains utilities for generating forms for cluster parameters.
 */

import React from 'react';
import { FormControl } from 'react-bootstrap';

import get from 'lodash/get';

import {
    ImageSelectControl,
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


const kindToControlMap = {
    'integer': IntegerControl,
    'number': NumberControl,
    'choice': ChoiceControl,
    'cloud.size': CloudSizeControl
};


export const ClusterParameterField = (props) => {
    const { tenancy, parameter, value, onChange, isCreate } = props;
    const Control = get(kindToControlMap, parameter.kind, TextControl);
    return (
        <Field
          name={parameter.name}
          label={parameter.label}
          helpText={parameter.description}>
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
