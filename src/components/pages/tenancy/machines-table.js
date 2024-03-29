/**
 * This module contains components for the machines table.
 */

import React from 'react';
import {
    Table, Button, ProgressBar, OverlayTrigger, Tooltip, Popover, Modal,
    Dropdown
} from 'react-bootstrap';

import moment from 'moment';

import sortBy from 'lodash/sortBy';

import { bindArgsToActions } from '../../utils';

import { AttachExternalIpMenuItem } from './external-ip-modal';

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
                <Dropdown.Item className="text-danger" onClick={this.open}>
                    Delete machine
                </Dropdown.Item>
                <Modal show={this.state.visible}>
                    <Modal.Body>
                        <p>
                            Are you sure you want to delete
                            {' '}
                            {this.props.name}
                            ?
                        </p>
                        <p><strong>Once deleted, a machine cannot be restored.</strong></p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button variant="danger" onClick={this.onConfirm}>Delete machine</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

function MachineSize(props) {
    const sizeDetails = (
        <Popover
            id={`machine-size-${props.machine.id}`}
        >
            <Popover.Header>
                Size details:
                <code>{props.size.name}</code>
            </Popover.Header>
            <Popover.Body>
                <Table striped hover bordered size="sm">
                    <tbody>
                        <tr>
                            <th>CPUs</th>
                            <td>{props.size.cpus}</td>
                        </tr>
                        <tr>
                            <th>RAM</th>
                            <td>
                                {props.size.ram}
                                MB
                            </td>
                        </tr>
                        <tr>
                            <th>Disk size</th>
                            <td>
                                {props.size.disk}
                                GB
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Popover.Body>
        </Popover>
    );
    return (
        <OverlayTrigger
            placement="right"
            overlay={sizeDetails}
            trigger="click"
            rootClose
        >
            <Button variant="link">{props.size.name}</Button>
        </OverlayTrigger>
    );
}

function MachineStatus(props) {
    const statusStyleMap = {
        BUILD: 'info',
        ACTIVE: 'success',
        ERROR: 'danger',
        OTHER: 'warning'
    };
    const statusTooltip = props.machine.status.details && (
        <Tooltip id={`machine-fault-${props.machine.id}`}>
            {props.machine.status.details}
        </Tooltip>
    );
    return (
        <span className={`resource-status text-${statusStyleMap[props.machine.status.type]}`}>
            {props.machine.status.name}
            {statusTooltip && (
                <OverlayTrigger placement="top" overlay={statusTooltip}>
                    <span>
                        {'\u00A0'}
                        <Button variant="link" className="tooltip-trigger">
                            <i className="fas fa-fw fa-question-circle" />
                            <span className="sr-only">Details</span>
                        </Button>
                    </span>
                </OverlayTrigger>
            )}
        </span>
    );
}

function MachineActionsDropdown(props) {
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
                id={`machine-actions-${props.machine.id}`}
                disabled={props.disabled}
            >
                {buttonTitle}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <AttachExternalIpMenuItem
                    machine={props.machine}
                    externalIps={props.externalIps}
                    externalIpActions={props.externalIpActions}
                    disabled={!!props.machineExternalIp || !props.machine.nat_allowed}
                />
                <Dropdown.Item
                    onClick={() => props.externalIpActions.update(
                        props.machineExternalIp,
                        { machine_id: null }
                    )}
                    disabled={!props.machineExternalIp}
                >
                    Detach external IP
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={props.machineActions.start}
                    disabled={props.machine.status.name === 'ACTIVE'}
                >
                    Start machine
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={props.machineActions.stop}
                    disabled={props.machine.status.name !== 'ACTIVE'}
                >
                    Stop machine
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={props.machineActions.restart}
                    disabled={props.machine.status.name !== 'ACTIVE'}
                >
                    Restart machine
                </Dropdown.Item>
                <ConfirmDeleteMenuItem
                    name={props.machine.name}
                    onConfirm={props.machineActions.delete}
                />
            </Dropdown.Menu>
        </Dropdown>
    );
}

function MachineRow(props) {
    const { machine } = props;
    // Find the external IP for the machine by searching the external IPs
    const externalIp = Object.values(props.externalIps.data || {})
        .find((ip) => (ip.machine || {}).id === machine.id);
    const highlightClass = (machine.status.type === 'BUILD')
        ? 'info'
        : ((machine.status.type === 'DELETED')
            ? 'danger'
            : ((!!machine.updating
              || !!machine.deleting
              || !!machine.task
              // An updating external IP counts as an action in progress
              || !!(externalIp || {}).updating
            ) && 'warning')
        );
    return (
        <tr className={`table-${highlightClass || undefined}`}>
            <td>{machine.name}</td>
            <td>{(machine.image || {}).name || '-'}</td>
            <td>{machine.size ? <MachineSize machine={machine} size={machine.size} /> : '-'}</td>
            <td><MachineStatus machine={machine} /></td>
            <td>{machine.power_state}</td>
            <td>
                {machine.task
                    ? <ProgressBar striped label={machine.task} now={100} />
                    : '-'}
            </td>
            <td>{machine.internal_ip || '-'}</td>
            <td>{(externalIp || {}).external_ip || '-'}</td>
            <td>{moment(machine.created).fromNow()}</td>
            <td>
                <MachineActionsDropdown
                    className="float-end"
                    disabled={!!highlightClass}
                    machine={machine}
                    machineExternalIp={(externalIp || {}).external_ip}
                    externalIps={props.externalIps}
                    machineActions={props.machineActions}
                    externalIpActions={props.externalIpActions}
                />
            </td>
        </tr>
    );
}

export class MachinesTable extends React.Component {
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
        // Sort the machines by name to ensure a consistent rendering
        const machines = sortBy(Object.values(this.props.machines), ['name']);
        return (
            <Table striped hover responsive>
                <caption>
                    {machines.length}
                    {' '}
                    machine
                    {machines.length !== 1 && 's'}
                </caption>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Image</th>
                        <th>Size</th>
                        <th>Status</th>
                        <th>Power State</th>
                        <th>Task</th>
                        <th>Internal IP</th>
                        <th>External IP</th>
                        <th>Created</th>
                        <th aria-label="Actions Menu" />
                    </tr>
                </thead>
                <tbody>
                    {machines.map((machine) => (
                        <MachineRow
                            key={machine.id}
                            machine={machine}
                            images={this.props.images}
                            sizes={this.props.sizes}
                            externalIps={this.props.externalIps}
                            machineActions={bindArgsToActions(this.props.machineActions, machine.id)}
                            externalIpActions={this.props.externalIpActions}
                        />
                    ))}
                </tbody>
            </Table>
        );
    }
}
