/**
 * This module contains the modal dialog for cluster creation.
 */

import React from 'react';
import { Button, Modal, Badge, Table, FormControl } from 'react-bootstrap';

import { Loading, Form, Field, RichSelect } from '../../utils';

import sortBy from 'lodash/sortBy';
import get from 'lodash/get';


class ClusterTypeForm extends React.Component {
    state = { selected: '' }

    setSelected = (selected) => this.setState({ selected })
    handleChange = (e) => this.setSelected(e.target.value)

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.onSubmit(this.state.selected);
    }

    render() {
        const { clusterTypes } = this.props;
        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <Modal.Body>
                    <Table striped hover className="table-selection">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortBy(Object.values(clusterTypes), ['name']).map(t => {
                                const selected = this.state.selected === t.name;
                                return (
                                    <tr
                                      key={t.name}
                                      className={selected ? 'success' : undefined}
                                      onClick={() => this.setSelected(t.name)}>
                                        <td>
                                            <input
                                              id={`radio-${t.name}`}
                                              type="radio"
                                              name="clusterType"
                                              value={t.name}
                                              checked={selected}
                                              onChange={this.handleChange} />
                                        </td>
                                        <td><label htmlFor={`radio-${t.name}`}>{t.label}</label></td>
                                        <td>{t.description}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" type="submit" disabled={!this.state.selected}>
                        <i className="fa fa-arrow-circle-right" />
                        {'\u00A0'}
                        Next
                    </Button>
                </Modal.Footer>
            </Form>
        );
    }
}


// FormControl sends through type=undefined, so remove it from props
const TextControl = ({ type, ...props }) => (<input type="text" {...props} />);
const NumberControl = ({ type, ...props }) => (<input type="number" {...props} />);
const IntegerControl = ({ type, ...props }) => (<NumberControl step="1" {...props} />);
const ChoiceControl = ({ choices, ...props }) => (
    <RichSelect {...props}>
        <option value="">Select one...</option>
        {choices.map(c => <option key={c}>{c}</option>)}
    </RichSelect>
);
const kindToControlMap = {
    'integer': IntegerControl,
    'number': NumberControl,
    'choice': ChoiceControl
};

const DefaultStaticControl = (props) => (<FormControl.Static>{props.value}</FormControl.Static>);
const kindToStaticControlMap = {
};

const ClusterParameterField = (props) => {
    const { parameter, value, onChange, isCreate } = props;
    const Control = get(kindToControlMap, parameter.kind, TextControl);
    const StaticControl = get(kindToStaticControlMap, parameter.kind, DefaultStaticControl);
    return (
        <Field
          name={parameter.name}
          label={parameter.label}
          helpText={parameter.description}>
            {parameter.immutable && !isCreate ?
                <StaticControl value={value} /> :
                <FormControl
                  componentClass={Control}
                  required={parameter.required}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  {...parameter.options} />
            }
        </Field>
    );
}


class ClusterParametersForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '',
            parameterValues: Object.assign(
                {},
                ...props.clusterType.parameters.map(p => ({ [p.name]: p.default || '' }))
            )
        }
    }

    handleNameChange = (e) => this.setState({ name: e.target.value })
    handleParameterValueChange = (name) => (value) => this.setState({
        parameterValues: {
            ...this.state.parameterValues,
            [name]: value
        }
    })

    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state);
        //this.props.onSubmit(this.state);
    }

    render() {
        const { label, parameters } = this.props.clusterType;
        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <Modal.Body>
                    <Field name="clusterType" label="Cluster Type">
                        <FormControl.Static>{label}</FormControl.Static>
                    </Field>
                    <Field name="name" label="Cluster name">
                        <FormControl
                          type="text"
                          placeholder="Cluster name"
                          required
                          pattern="[A-Za-z0-9\.\-]+"
                          title="Must contain alphanumeric characters, dot (.) and dash (-) only."
                          value={this.state.name}
                          onChange={this.handleNameChange} />
                    </Field>
                    {parameters.map(p => (
                        <ClusterParameterField
                          key={p.name}
                          isCreate={true}
                          parameter={p}
                          value={this.state.parameterValues[p.name]}
                          onChange={this.handleParameterValueChange(p.name)} />
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.goBack}>
                        <i className="fa fa-arrow-circle-left" />
                        {'\u00A0'}
                        Back
                    </Button>
                    <Button bsStyle="success" type="submit">
                        <i className="fa fa-plus" />
                        {'\u00A0'}
                        Create cluster
                    </Button>
                </Modal.Footer>
            </Form>
        );
    }
}


export class CreateClusterButton extends React.Component {
    state = { visible: false, clusterType: '' }

    open = () => this.setState({ visible: true })
    close = () => this.setState({ visible: false })

    componentDidUpdate(_, prevState) {
        // If transitioning from not open to open, reset clusterType
        if( !prevState.visible && this.state.visible )
            this.setState({ clusterType: '' })
    }

    handleClusterTypeSelected = (clusterType) => this.setState({ clusterType });

    render() {
        const { creating, clusterTypes: { fetching, data: clusterTypes } } = this.props;
        return (
            <>
                <Button
                  bsStyle="success"
                  disabled={creating}
                  onClick={this.open}
                  title="Create a new cluster">
                    { creating ? (
                        <i className="fa fa-spinner fa-pulse" />
                    ) : (
                        <i className="fa fa-sitemap"></i>
                    )}
                    {'\u00A0\u00A0'}
                    { creating ? 'Creating cluster...' : 'New cluster' }
                </Button>
                <Modal
                  backdrop="static"
                  onHide={this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new cluster</Modal.Title>
                    </Modal.Header>
                    <ul className="steps steps-2">
                        <li className={this.state.clusterType ? 'success' : 'active'}>
                            <Badge>1</Badge> Cluster type
                        </li>
                        <li className={this.state.clusterType ? 'active' : undefined}>
                            <Badge>2</Badge> Cluster parameters
                        </li>
                    </ul>
                    {clusterTypes ? (
                        this.state.clusterType ?
                            <ClusterParametersForm
                              clusterType={clusterTypes[this.state.clusterType]}
                              goBack={() => this.setState({ clusterType: '' })} /> :
                            <ClusterTypeForm
                              clusterTypes={clusterTypes}
                              onSubmit={this.handleClusterTypeSelected} />
                    ) : (
                        fetching ? (
                            <Loading message="Loading cluster types..."/>
                        ) : (
                            <div
                              role="notification"
                              className="notification notification-inline notification-danger">
                                <div className="notification-content">Unable to load cluster types</div>
                            </div>
                        )
                    )}
                </Modal>
            </>
        );
    }
}
