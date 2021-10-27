/**
 * This module contains the modal dialog for cluster creation.
 */

import React from 'react';
import {
    Col, Card, Button, Modal, Badge, Form, Row
} from 'react-bootstrap';

import sortBy from 'lodash/sortBy';

import ReactMarkdown from 'react-markdown';

import { Loading, HorizFormGroup } from '../../utils';
import { ClusterParameterField } from './cluster-parameter-field';

class ClusterTypePanel extends React.Component {
    state = { hovering: false };

    handleMouseEnter = () => this.setState({ hovering: true })

    handleMouseLeave = () => this.setState({ hovering: false })

    render() {
        const { clusterType, onSelect } = this.props;
        return (
            <Col key={clusterType.name} md={4} sm={6} className="mb-2">
                <Card
                    border={this.state.hovering ? 'primary' : undefined}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                    onClick={() => onSelect(clusterType.name)}
                >
                    <Card.Header>{clusterType.label}</Card.Header>
                    <Card.Body className="d-flex justify-content-center">
                        <Card.Img
                            className="p-2 mw-100"
                            variant="top"
                            src={clusterType.logo}
                            bsPrefix="img-fluid"
                        />
                    </Card.Body>
                    <Card.Footer><ReactMarkdown source={clusterType.description} /></Card.Footer>
                </Card>
            </Col>
        );
    }
}

function ClusterTypeForm(props) {
    const { clusterTypes, onSelect } = props;
    return (
        <Modal.Body className="cluster-type-select">
            <Row>
                {sortBy(Object.values(clusterTypes), ['name']).map((ct, i) => (
                    <React.Fragment key={ct.name}>
                        <ClusterTypePanel clusterType={ct} onSelect={onSelect} />
                        {/*
                        {i % 2 === 1 && <visibleSmBlock />}
                        {i % 3 === 2 && <visibleMdBlock visibleLgBlock />}
                        */}
                    </React.Fragment>
                ))}
            </Row>
        </Modal.Body>
    );
}

class ClusterParametersForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            parameterValues: Object.assign(
                {},
                ...props.clusterType.parameters
                    .filter((p) => p.required)
                    .map((p) => ({ [p.name]: p.default || '' }))
            )
        };
    }

    handleNameChange = (e) => this.setState({ name: e.target.value })

    handleParameterValueChange = (name) => (value) => {
        if (value !== '') {
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

        // React select pickers hold state in an object rather than a value.
        // We must transform the data to remove this before submission.
        const { parameterValues } = this.state;
        Object.keys(parameterValues).forEach((k) => {
            if (typeof (parameterValues[k]) === 'object') {
                parameterValues[k] = parameterValues[k].value;
            }
        });
        this.state.parameterValues = parameterValues;
        console.log(this.state);
        // this.props.onSubmit(this.state);
    }

    render() {
        const { label, parameters } = this.props.clusterType;
        return (
            <Form onSubmit={this.handleSubmit}>
                <Modal.Body>
                    <HorizFormGroup
                        controlId="clusterType"
                        label="Cluster Type"
                        labelWidth={3}
                        value={label}
                        readOnly
                        plaintext
                    />
                    <HorizFormGroup
                        controlId="name"
                        label="Cluster name"
                        labelWidth={3}
                        type="text"
                        placeholder="Cluster name"
                        required
                        pattern="[A-Za-z0-9\-]+"
                        title="Must contain alphanumeric characters and dash (-) only."
                        value={this.state.name}
                        onChange={this.handleNameChange}
                    />
                    {parameters.map((p) => (
                        <ClusterParameterField
                            key={p.name}
                            tenancy={this.props.tenancy}
                            tenancyActions={this.props.tenancyActions}
                            isCreate
                            parameter={p}
                            value={this.state.parameterValues[p.name] || ''}
                            onChange={this.handleParameterValueChange(p.name)}
                        />
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.goBack}>
                        <i className="fas fa-arrow-circle-left" />
                        {'\u00A0'}
                        Back
                    </Button>
                    <Button variant="success" type="submit">
                        <i className="fas fa-plus" />
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
        if (!prevState.visible && this.state.visible) this.setState({ clusterType: '' });
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
                    variant="success"
                    disabled={creating}
                    onClick={this.open}
                    title="Create a new cluster"
                    className="text-white"
                >
                    { creating ? (
                        <i className="fa fa-spinner fa-pulse" />
                    ) : (
                        <i className="fa fa-sitemap" />
                    )}
                    {'\u00A0\u00A0'}
                    { creating ? 'Creating cluster...' : 'New cluster' }
                </Button>
                <Modal
                    backdrop="static"
                    onHide={this.close}
                    size="lg"
                    show={this.state.visible}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new cluster</Modal.Title>
                    </Modal.Header>
                    <ul className="steps">
                        <li className={this.state.clusterType ? 'bg-success' : 'bg-warning'}>
                            <Badge>1</Badge>
                            {' '}
                            Cluster type
                        </li>
                        <li className={this.state.clusterType ? 'bg-warning' : undefined}>
                            <Badge>2</Badge>
                            {' '}
                            Cluster options
                        </li>
                    </ul>
                    {clusterTypes.data ? (
                        !this.state.clusterType ? (
                            <ClusterTypeForm
                                clusterTypes={clusterTypes.data}
                                onSelect={this.handleClusterTypeSelected}
                            />
                        ) : (
                            <ClusterParametersForm
                                tenancy={this.props.tenancy}
                                tenancyActions={this.props.tenancyActions}
                                clusterType={clusterTypes.data[this.state.clusterType]}
                                goBack={() => this.setState({ clusterType: '' })}
                                onSubmit={this.handleClusterParamsSubmitted}
                            />
                        )
                    ) : (
                        <Modal.Body>
                            {clusterTypes.fetching ? (
                                <Loading message="Loading cluster types..." />
                            ) : (
                                <div
                                    className="notification notification-inline notification-danger"
                                >
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
