/**
 * This module contains the modal dialog for cluster creation.
 */

import React from 'react';
import { Button, Modal, Badge, Table, FormControl } from 'react-bootstrap';

import sortBy from 'lodash/sortBy';

import { Loading, Form, Field } from '../../utils';
import { ClusterParameterField } from './cluster-parameter-field';


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


class ClusterParametersForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            parameterValues: Object.assign(
                {},
                ...props.clusterType.parameters
                    .filter(p => p.required)
                    .map(p => ({ [p.name]: p.default || '' }))
            )
        };
    }

    handleNameChange = (e) => this.setState({ name: e.target.value })
    handleParameterValueChange = (name) => (value) => {
        if( value !== '' ) {
            this.setState({
                parameterValues: { ...this.state.parameterValues, [name]: value }
            });
        } else {
            const { [name]: _, ...nextParams } = this.state.parameterValues;
            this.setState({ parameterValues: nextParams });
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.onSubmit(this.state);
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
                          tenancy={this.props.tenancy}
                          isCreate={true}
                          parameter={p}
                          value={this.state.parameterValues[p.name] || ''}
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
    handleClusterParamsSubmitted = ({ name, parameterValues }) => {
        this.props.create({
            name,
            cluster_type: this.state.clusterType,
            parameter_values: parameterValues
        });
        this.close();
    }

    render() {
        const { creating, tenancy: { clusterTypes } } = this.props;
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
                            <Badge>2</Badge> Cluster options
                        </li>
                    </ul>
                    {clusterTypes.data ? (
                        !this.state.clusterType ? (
                            <ClusterTypeForm
                              clusterTypes={clusterTypes.data}
                              onSubmit={this.handleClusterTypeSelected} />
                        ) : (
                            <ClusterParametersForm
                              tenancy={this.props.tenancy}
                              clusterType={clusterTypes.data[this.state.clusterType]}
                              goBack={() => this.setState({ clusterType: '' })}
                              onSubmit={this.handleClusterParamsSubmitted} />
                        )
                    ) : (
                        <Modal.Body>
                            {clusterTypes.fetching ? (
                                <Loading message="Loading cluster types..."/>
                            ) : (
                                <div
                                role="notification"
                                className="notification notification-inline notification-danger">
                                    <div className="notification-content">Unable to load cluster types</div>
                                </div>
                            )}
                        </Modal.Body>
                    )}
                </Modal>
            </>
        );
    }
}
