/**
 * This module contains components for the machines table.
 */

import React from 'react';
import {
    Table,
    Button,
    Modal,
    DropdownButton,
    MenuItem,
    Form,
    FormControl,
    Tooltip,
    OverlayTrigger,
    ProgressBar
} from 'react-bootstrap';

import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import truncate from 'lodash/truncate';

import moment from 'moment';

import { bindArgsToActions, Field } from '../../utils';
import { ClusterParameterField } from './cluster-parameter-field';


class UpdateClusterParametersMenuItem extends React.Component {
    state = { visible: false, parameterValues: {} }

    open = () => this.setState({ visible: true });
    close = () => this.setState({ visible: false });

    componentDidUpdate(_, prevState) {
        // If transitioning from not open to open, reset the parameters
        if( !prevState.visible && this.state.visible ) {
            // By matching the cluster's parameter_values against the parameters
            // for the cluster type, we can account for times when the required
            // parameters have changed
            const { cluster, tenancy: { clusterTypes: { data: clusterTypes } } } = this.props;
            const parameters = get(clusterTypes, [cluster.cluster_type, 'parameters'], []);
            this.setState({
                parameterValues: Object.assign(
                    {},
                    ...parameters
                        .map(p => ([p.name, get(cluster.parameter_values, p.name, p.default || '')]))
                        .filter(([_, value]) => value !== '')
                        .map(([name, value]) => ({ [name]: value }))
                )
            });
        }
    }

    handleChange = (name) => (value) => {
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
        this.props.onSubmit({ parameter_values: this.state.parameterValues });
        this.close();
    }

    render() {
        const { cluster, tenancy } = this.props;
        const { clusterTypes: { data: clusterTypes } } = tenancy;
        const clusterType = get(clusterTypes, cluster.cluster_type);
        const parameters = get(clusterType, 'parameters', []);
        // If the cluster has a cluster type that doesn't exist, disable updates
        // It will either become available, or it no longer exists
        return (
            <>
                <MenuItem onSelect={this.open} disabled={!clusterType}>
                    Update cluster options
                </MenuItem>
                <Modal
                  backdrop="static"
                  onHide={this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update cluster: {cluster.name}</Modal.Title>
                    </Modal.Header>
                    <Form horizontal onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <Field name="clusterType" label="Cluster Type">
                                <FormControl.Static>{get(clusterType, 'label', '-')}</FormControl.Static>
                            </Field>
                            {parameters.map(p => (
                                <ClusterParameterField
                                  key={p.name}
                                  tenancy={this.props.tenancy}
                                  isCreate={false}
                                  parameter={p}
                                  value={this.state.parameterValues[p.name] || ''}
                                  onChange={this.handleChange(p.name)} />
                            ))}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="success" type="submit">
                                <i className="fa fa-save" />
                                {'\u00A0'}
                                Update cluster
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </>
        );
    }
}


class ConfirmPatchMenuItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false };
    }

    open = () => this.setState({ visible: true });
    close = () => this.setState({ visible: false });

    onConfirm = () => {
        this.props.onConfirm();
        this.close();
    }

    render() {
        return (
            <>
                <MenuItem onSelect={this.open}>Patch cluster</MenuItem>
                <Modal show={this.state.visible}>
                    <Modal.Body>
                        <p>Are you sure you want to patch {this.props.name}?</p>
                        <p><strong>This is a potentially disruptive operation, and may affect workloads on the cluster. Once started, it cannot be stopped.</strong></p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button bsStyle="warning" onClick={this.onConfirm}>Patch cluster</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}


class ConfirmDeleteMenuItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false };
    }

    open = () => this.setState({ visible: true });
    close = () => this.setState({ visible: false });

    onConfirm = () => {
        this.props.onConfirm();
        this.close();
    }

    render() {
        return (
            <>
                <MenuItem className="danger" onSelect={this.open}>Delete cluster</MenuItem>
                <Modal show={this.state.visible}>
                    <Modal.Body>
                        <p>Are you sure you want to delete {this.props.name}?</p>
                        <p><strong>Once deleted, a cluster cannot be restored.</strong></p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button bsStyle="danger" onClick={this.onConfirm}>Delete cluster</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}


function ClusterStatus(props) {
    const statusStyleMap = {
        'CONFIGURING': 'info',
        'READY': 'success',
        'DELETING': 'danger',
        'ERROR': 'danger'
    };
    const statusTooltip = props.cluster.error_message && (
        <Tooltip id={`cluster-error-${props.cluster.id}`}>
            {props.cluster.error_message}
        </Tooltip>
    );
    const className = `resource-status text-${statusStyleMap[props.cluster.status]}`;
    return statusTooltip ? (
        <OverlayTrigger placement="top" overlay={statusTooltip}>
            <span className={className + ' tooltip-trigger'}>
                <i className="fa fa-exclamation-circle"></i>
                {'\u00A0'}
                {props.cluster.status}
            </span>
        </OverlayTrigger>
    ) : (
        <span className={className}>{props.cluster.status}</span>
    );
}


function ClusterPatched(props) {
    const threshold = moment().subtract(2, 'weeks');
    const patched = moment(props.cluster.patched);
    const tooltip = (
        <Tooltip id={`cluster-patched-${props.cluster.id}`}>
            This cluster has not been patched recently.
        </Tooltip>
    );
    return patched.isAfter(threshold) ?
        patched.fromNow() :
        <OverlayTrigger placement="top" overlay={tooltip}>
            <strong className="text-danger tooltip-trigger">
                <i className="fa fa-exclamation-circle"></i>
                {'\u00A0'}
                {patched.fromNow()}
            </strong>
        </OverlayTrigger>;
}


function ClusterActionsDropdown(props) {
    const buttonTitle = props.disabled ?
        <span>
            <i className="fa fa-fw fa-spinner fa-pulse" />
            <span className="sr-only">Working...</span>
        </span> :
        'Actions...';
    return (
        <DropdownButton
          id={`cluster-actions-${props.cluster.name}`}
          bsStyle="default"
          block
          title={buttonTitle}
          pullRight
          disabled={props.disabled}>
            <ConfirmPatchMenuItem
              name={props.cluster.name}
              onConfirm={props.clusterActions.patch} />
            <UpdateClusterParametersMenuItem
              cluster={props.cluster}
              tenancy={props.tenancy}
              onSubmit={props.clusterActions.update} />
            <ConfirmDeleteMenuItem
              name={props.cluster.name}
              onConfirm={props.clusterActions.delete} />
        </DropdownButton>
    );
}

function ClusterRow(props) {
    const { cluster, tenancy } = props;
    const { clusterTypes: { data: clusterTypes } } = tenancy;
    const highlightClass = (cluster.status === 'CONFIGURING') ?
        'info' :
        (cluster.updating ?
            'warning' :
            (cluster.status == 'DELETING' && 'danger')
        );
    return (
        <tr className={highlightClass || undefined}>
            <td>{cluster.name}</td>
            <td>{get(clusterTypes, [cluster.cluster_type, 'label'], '-')}</td>
            <td><ClusterStatus cluster={cluster} /></td>
            <td>{cluster.task ?
                <ProgressBar active striped label={truncate(cluster.task)} now={100} /> :
                '-'
            }</td>
            <td>{moment(cluster.created).fromNow()}</td>
            <td>{moment(cluster.updated).fromNow()}</td>
            <td><ClusterPatched cluster={cluster} /></td>
            <td className="resource-actions">
                <ClusterActionsDropdown
                  disabled={!!highlightClass}
                  cluster={cluster}
                  tenancy={tenancy}
                  clusterActions={props.clusterActions} />
            </td>
        </tr>
    );
}


export class ClustersTable extends React.Component {
    componentDidMount() {
        // Responsive tables don't play nice with dropdown menus (the menu gets
        // clipped by the responsive wrapper)
        // To get around this, we add a margin to the bottom of the table that
        // pushes the responsive wrapper out to the point where the bottom
        // dropdown has space to render
        // When this component mounts, we add a body class so that we can add a
        // negative margin to pull the footer back up
        // When it unmounts, we remove it again
        document.body.classList.add('resource-page');
    }

    componentWillUnmount() {
        document.body.classList.remove('resource-page')
    }

    render() {
        // Sort the clusters by name to ensure a consistent rendering
        const clusters = sortBy(Object.values(this.props.clusters), 'name');
        return (
            <Table striped hover responsive>
                <caption>
                    {clusters.length} cluster{clusters.length !== 1 && 's'}
                </caption>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Cluster Type</th>
                        <th>Status</th>
                        <th>Task</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Patched</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {clusters.map(cluster =>
                        <ClusterRow
                          key={cluster.id}
                          cluster={cluster}
                          tenancy={this.props.tenancy}
                          clusterActions={bindArgsToActions(this.props.clusterActions, cluster.id)} />
                    )}
                </tbody>
            </Table>
        );
    }
}
