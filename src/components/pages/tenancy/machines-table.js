/**
 * This module contains components for the machines table.
 */

import React from 'react';
import {
    Table, ButtonGroup, Button, ProgressBar, OverlayTrigger, Tooltip, Popover, Modal
} from 'react-bootstrap';

import at from 'lodash/at';
import moment from 'moment';

import { MachineVolumesModalButton } from './machine-volumes-modal';


class ConfirmDeleteModalButton extends React.Component {
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
            <Button
              title="Delete machine"
              bsStyle="danger"
              bsSize="xs"
              onClick={this.open}
              disabled={this.props.disabled}>
                <i className="fa fa-fw fa-ban" />
                <span className="sr-only">Delete machine</span>
                <Modal show={this.state.visible}>
                    <Modal.Body>
                        Are you sure? Once deleted, a machine cannot be restored.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button bsStyle="danger" onClick={this.onConfirm}>Delete machine</Button>
                    </Modal.Footer>
                </Modal>
            </Button>
        );
    }
}


class MachineRow extends React.Component {
    formatMachineSize(machine) {
        const sizeDetails = (
            <Popover
              id={`machine-size-${machine.id}`}
              title={<span>Size details: <code>{machine.size.name}</code></span>}>
                <Table striped hover bordered>
                    <tbody>
                        <tr>
                            <th>CPUs</th>
                            <td>{machine.size.cpus}</td>
                        </tr>
                        <tr>
                            <th>RAM</th>
                            <td>{machine.size.ram}MB</td>
                        </tr>
                        <tr>
                            <th>Disk size</th>
                            <td>{machine.size.disk}GB</td>
                        </tr>
                    </tbody>
                </Table>
            </Popover>
        );
        return (
            <OverlayTrigger
              placement="right"
              overlay={sizeDetails}
              trigger="click"
              rootClose>
                <a href="#" className="size-details">{machine.size.name}</a>
            </OverlayTrigger>
        );
    }

    formatMachineStatus(machine) {
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

    formatTask(task) {
        return task ?
            <ProgressBar active striped label={task} now={100} /> :
            'None';
    }

    render() {
        const machine = this.props.machine;
        const highlightClass = (machine.status.type === 'BUILD') ? 'info' :
            ((!!machine.actionInProgress || !!machine.task) && 'warning');
        const disableControls = (
            machine.status.type === 'BUILD' ||
            !!machine.actionInProgress ||
            !!machine.task
        );
        const externalIp = at(
            Object
                .entries(this.props.externalIps || {})
                .find(([ip, mid]) => mid === machine.id),
            '[0]'
        )[0];
        return (
            <tr className={highlightClass}>
                <td><code>{machine.name}</code></td>
                <td><code>{machine.image.name}</code></td>
                <td>{this.formatMachineSize(machine)}</td>
                <td>{this.formatMachineStatus(machine)}</td>
                <td>{machine.power_state}</td>
                <td>{this.formatTask(machine.task)}</td>
                <td><code>{machine.internal_ip || '-'}</code></td>
                <td><code>{externalIp || '-'}</code></td>
                <td>{moment(machine.created).fromNow()}</td>
                <td className="machine-actions">
                    {disableControls && (
                        <div className="machine-working">
                            <i className="fa fa-spinner fa-pulse fa-fw text-muted" />
                            <span className="sr-only">Working...</span>
                        </div>
                    )}
                    <ButtonGroup>
                        <MachineVolumesModalButton
                          disabled={disableControls}
                          machine={machine}
                          volumes={machine.attached_volumes}
                          attachingVolume={machine.attachingVolume}
                          detachingVolume={machine.detachingVolume}
                          attachVolume={this.props.attachVolume}
                          detachVolume={this.props.detachVolume} />
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
                        <ConfirmDeleteModalButton
                          disabled={disableControls}
                          onConfirm={this.props.deleteMachine} />
                    </ButtonGroup>
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
        const machines = Object.values(data || {});
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
                          externalIps={this.props.externalIps}
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
