/**
 * This module contains components for the machines table.
 */

import React from 'react';
import {
    Table, ButtonGroup, Button, ProgressBar, OverlayTrigger, Tooltip, Modal
} from 'react-bootstrap';

import moment from 'moment';

import { MachineVolumesModal } from './machine-volumes-modal';


class DeleteMachineConfirmation extends React.Component {
    render() {
        return (
            <Modal show={this.props.show}>
                <Modal.Body>
                    Are you sure? Once deleted, a machine cannot be restored.
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onCancel}>Cancel</Button>
                    <Button bsStyle="danger" onClick={this.props.onConfirm}>Delete machine</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}


class MachineRow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            machineVolumesModalVisible: false,
            confirmDeleteModalVisible: false
        };
    }

    openConfirmDeleteModal = () => this.setState({ confirmDeleteModalVisible: true })
    closeConfirmDeleteModal = () => this.setState({ confirmDeleteModalVisible: false })

    openMachineVolumesModal = () => this.setState({ machineVolumesModalVisible: true })
    closeMachineVolumesModal = () => this.setState({ machineVolumesModalVisible: false })

    deleteMachineConfirmed = () => {
        this.props.deleteMachine()
        this.closeConfirmDeleteModal()
    }

    formatMachineStatus = (machine) => {
        const statusStyleMap = {
            'BUILD': 'info',
            'ACTIVE': 'success',
            'ERROR': 'danger',
            'OTHER': 'warning'
        };
        const statusTooltip = machine.status.details && (
            <Tooltip id={`machine-fault-${machine.id}`}>
                {machine.status.details}
            </Tooltip>
        );
        return (
            <span className={`machine-status text-${statusStyleMap[machine.status.type]}`}>
                {machine.status.name}
                {statusTooltip && (
                    <OverlayTrigger placement="top" overlay={statusTooltip}>
                        <span>
                            {' '}
                            <a className="tooltip-trigger">
                                <i className="fa fa-fw fa-question-circle" />
                                <span className="sr-only">Details</span>
                            </a>
                        </span>
                    </OverlayTrigger>
                )}
            </span>
        );
    }

    formatTask = (task) => task ?
        <ProgressBar active striped label={task} now={100} /> :
        'None';

    formatIpList = (ips) => (ips.length > 0) ?
        <ul className="ip-list">
            {ips.map(ip => <li key={ip}><code>{ip}</code></li>)}
        </ul> :
        (<code>-</code>);

    render() {
        const machine = this.props.machine;
        const highlightClass = (machine.status.type === 'BUILD') ? 'info' :
            ((!!machine.actionInProgress || !!machine.task) && 'warning');
        const disableControls = (
            machine.status.type === 'BUILD' ||
            !!machine.actionInProgress ||
            !!machine.task
        );
        return (
            <tr className={highlightClass}>
                <td><code>{machine.name}</code></td>
                <td><code>{machine.image.name}</code></td>
                <td><code>{machine.size.name}</code></td>
                <td>{this.formatMachineStatus(machine)}</td>
                <td>{machine.power_state}</td>
                <td>{this.formatTask(machine.task)}</td>
                <td>{this.formatIpList(machine.internal_ips)}</td>
                <td>{this.formatIpList(machine.external_ips)}</td>
                <td>{moment(machine.created).fromNow()}</td>
                <td className="machine-actions">
                    {disableControls && (
                        <div className="machine-working">
                            <i className="fa fa-spinner fa-pulse fa-fw text-muted" />
                            <span className="sr-only">Working...</span>
                        </div>
                    )}
                    <ButtonGroup>
                        <Button
                          title="Manage volumes"
                          bsStyle="primary"
                          bsSize="xs"
                          onClick={this.openMachineVolumesModal}
                          disabled={disableControls}>
                            <i className="fa fa-fw fa-database" />
                            <span className="sr-only">Manage volumes</span>
                        </Button>
                        <Button
                          title="Start machine"
                          bsStyle="success"
                          bsSize="xs"
                          onClick={this.props.startMachine}
                          disabled={disableControls}>
                            <i className="fa fa-fw fa-play" />
                            <span className="sr-only">Start machine</span>
                        </Button>
                        <Button
                          title="Stop machine"
                          bsStyle="warning"
                          bsSize="xs"
                          onClick={this.props.stopMachine}
                          disabled={disableControls}>
                            <i className="fa fa-fw fa-power-off" />
                            <span className="sr-only">Stop machine</span>
                        </Button>
                        <Button
                          title="Restart machine"
                          bsStyle="info"
                          bsSize="xs"
                          onClick={this.props.restartMachine}
                          disabled={disableControls}>
                            <i className="fa fa-fw fa-repeat" />
                            <span className="sr-only">Restart machine</span>
                        </Button>
                        <Button
                          title="Delete machine"
                          bsStyle="danger"
                          bsSize="xs"
                          onClick={this.openConfirmDeleteModal}
                          disabled={disableControls}>
                            <i className="fa fa-fw fa-ban" />
                            <span className="sr-only">Delete machine</span>
                        </Button>
                    </ButtonGroup>
                    <MachineVolumesModal
                      show={this.state.machineVolumesModalVisible}
                      close={this.closeMachineVolumesModal}
                      volumes={machine.attached_volumes}
                      attachingVolume={machine.attachingVolume}
                      detachingVolume={machine.detachingVolume}
                      attachVolume={this.props.attachVolume}
                      detachVolume={this.props.detachVolume} />
                    <DeleteMachineConfirmation
                      show={this.state.confirmDeleteModalVisible}
                      onConfirm={this.deleteMachineConfirmed}
                      onCancel={this.closeConfirmDeleteModal} />
                </td>
            </tr>
        );
    }
}

const _STATUS_STYLE_MAP = {
    'BUILD': 'info',
    'ACTIVE': 'success',
    'ERROR': 'danger',
    'OTHER': 'warning'
};


export class MachinesTable extends React.Component {
    render() {
        const { fetching, data } = this.props.machines;
        const machines = Object.values(data);
        // Sort the machines by name to ensure a consistent rendering
        machines.sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
        return (
            <Table striped hover responsive className="machines-table">
                {fetching ? (
                    <caption>
                        <i className="fa fa-spinner fa-pulse fa-fw" />
                        {' '}
                        Loading machines...
                    </caption>
                ) : (
                    <caption>
                        {machines.length} machine{machines.length !== 1 && 's'}
                    </caption>
                )}
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
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {machines.map(m =>
                        <MachineRow
                          key={m.id}
                          machine={m}
                          startMachine={() => this.props.startMachine(m.id)}
                          stopMachine={() => this.props.stopMachine(m.id)}
                          restartMachine={() => this.props.restartMachine(m.id)}
                          deleteMachine={() => this.props.deleteMachine(m.id)}
                          attachVolume={(size) => this.props.attachVolume(m.id, size)}
                          detachVolume={(vid) => this.props.detachVolume(m.id, vid)} />
                    )}
                </tbody>
            </Table>
        );
    }
}
