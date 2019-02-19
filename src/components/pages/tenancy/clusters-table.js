/**
 * This module contains components for the machines table.
 */

import React from 'react';
import {
    Table, Button, ProgressBar, OverlayTrigger, Tooltip, Popover, Modal,
    DropdownButton, MenuItem
} from 'react-bootstrap';

import { bindArgsToActions } from '../../utils';


class ConfirmDeleteMenuItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false };
    }

    open = () => this.setState({ visible: true });
    close = () => this.setState({ visible: false });

    onConfirm = () => {
        //this.props.onConfirm();
        this.close();
    }

    render() {
        return (
            <>
                <MenuItem className="danger" onSelect={this.open}>
                    Delete cluster
                </MenuItem>
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
            <MenuItem>Cluster properties</MenuItem>
            <ConfirmDeleteMenuItem
              name={props.cluster.name}
              onConfirm={props.clusterActions.delete} />
        </DropdownButton>
    );
}

function ClusterRow(props) {
    const cluster = props.cluster;
/*    const highlightClass = (machine.status.type === 'BUILD') ?
        'info' :
        ((machine.status.type === 'DELETED') ?
            'danger' :
            ((!!machine.updating ||
              !!machine.deleting ||
              !!machine.task ||
              // An updating external IP counts as an action in progress
              !!(externalIp || {}).updating
            ) && 'warning')
        );*/
    const highlightClass = null;
    return (
        <tr className={highlightClass || undefined}>
            <td>{cluster.name}</td>
            <td className="resource-actions">
                <ClusterActionsDropdown
                  disabled={!!highlightClass}
                  cluster={cluster}
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
        const clusters = Object.values(this.props.clusters)
            .sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
        return (
            <Table striped hover responsive>
                <caption>
                    {clusters.length} cluster{clusters.length !== 1 && 's'}
                </caption>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {clusters.map(cluster =>
                        <ClusterRow
                          key={cluster.id}
                          cluster={cluster}
                          clusterActions={bindArgsToActions(this.props.clusterActions, cluster.name)} />
                    )}
                </tbody>
            </Table>
        );
    }
}
