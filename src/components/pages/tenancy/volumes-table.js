/**
 * This module contains components for the machines table.
 */

import React from 'react';
import {
    Table, Button, Modal, Dropdown
} from 'react-bootstrap';

import sortBy from 'lodash/sortBy';

import { bindArgsToActions } from '../../utils';

import { AttachVolumeMenuItem } from './attach-volume-modal';

class ConfirmDeleteMenuItem extends React.Component {
    constructor(props) {
        super(props);
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
                <Dropdown.Item
                    className="text-danger"
                    disabled={this.props.disabled}
                    onClick={this.open}
                >
                    Delete volume
                </Dropdown.Item>
                <Modal show={this.state.visible}>
                    <Modal.Body>
                        <p>
                            Are you sure you want to delete
                            {' '}
                            {this.props.name}
                            {' '}
                            ?
                        </p>
                        <p><strong>Once deleted, a volume cannot be restored.</strong></p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button variant="danger" onClick={this.onConfirm}>Delete volume</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

function VolumeStatus(props) {
    const statusStyleMap = {
        CREATING: 'info',
        AVAILABLE: 'success',
        ATTACHING: 'warning',
        DETACHING: 'warning',
        IN_USE: 'success',
        DELETING: 'danger',
        ERROR: 'danger',
        OTHER: 'warning'
    };
    return (
        <span className={`resource-status text-${statusStyleMap[props.status]}`}>
            {props.status}
        </span>
    );
}

function VolumeActionsDropdown(props) {
    const buttonTitle = props.disabled
        ? (
            <span>
                <i className="fas fa-fw fa-spinner fa-pulse" />
                <span className="sr-only">Working...</span>
            </span>
        )
        : 'Actions...';
    return (
        <Dropdown className="ms-auto">
            <Dropdown.Toggle
                id={`volume-actions-${props.volume.id}`}
                disabled={props.disabled}
            >
                {buttonTitle}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <AttachVolumeMenuItem
                    volume={props.volume}
                    machines={props.machines}
                    attach={(mid) => props.volumeActions.update({ machine_id: mid })}
                />
                <Dropdown.Item
                    disabled={!props.volume.machine}
                    onClick={() => props.volumeActions.update({ machine_id: null })}
                >
                    Detach volume from machine
                </Dropdown.Item>
                <ConfirmDeleteMenuItem
                    name={props.volume.name}
                    disabled={!['AVAILABLE', 'ERROR'].includes(props.volume.status.toUpperCase())}
                    onConfirm={props.volumeActions.delete}
                />
            </Dropdown.Menu>
        </Dropdown>
    );
}

function VolumeRow(props) {
    const { volume } = props;
    const status = volume.status.toUpperCase();
    const highlightClass = (status === 'CREATING')
        ? 'info'
        : ((status === 'DELETING')
            ? 'danger'
            : (['ATTACHING', 'DETACHING'].includes(status)
             || !!volume.updating
             || !!volume.deleting
            ) && 'warning');
    // Try and find the attached machine
    const attachedTo = (props.machines.data || {})[(volume.machine || {}).id];
    return (
        <tr className={`table-${highlightClass || undefined}`}>
            <td>{volume.name}</td>
            <td><VolumeStatus status={volume.status} /></td>
            <td>
                {volume.size}
                {' '}
                GB
            </td>
            <td>
                {attachedTo ? (
                    `Attached to ${(attachedTo || {}).name || '-'} on ${volume.device}`
                ) : (
                    '-'
                )}
            </td>
            <td className="d-flex">
                <VolumeActionsDropdown
                    disabled={!!highlightClass}
                    volume={volume}
                    machines={props.machines}
                    volumeActions={props.volumeActions}
                />
            </td>
        </tr>
    );
}

export class VolumesTable extends React.Component {
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
        document.body.classList.remove('resource-page');
    }

    render() {
        // Sort the volumes by name to ensure a consistent rendering
        const volumes = sortBy(Object.values(this.props.volumes), ['name']);
        return (
            <Table striped hover responsive>
                <caption>
                    {volumes.length}
                    {' '}
                    volume
                    {volumes.length !== 1 && 's'}
                </caption>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Size</th>
                        <th>Attached To</th>
                        <th aria-label="Actions menu." />
                    </tr>
                </thead>
                <tbody>
                    {volumes.map((volume) => (
                        <VolumeRow
                            key={volume.id}
                            volume={volume}
                            machines={this.props.machines}
                            volumeActions={bindArgsToActions(this.props.volumeActions, volume.id)}
                        />
                    ))}
                </tbody>
            </Table>
        );
    }
}
