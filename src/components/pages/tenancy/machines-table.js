/**
 * This module contains components for the machines table.
 */

import React from 'react';
import {
    Table, Button, ProgressBar, OverlayTrigger, Tooltip, Popover, Modal,
    DropdownButton, MenuItem
} from 'react-bootstrap';

import moment from 'moment';

import sortBy from 'lodash/sortBy';

import { bindArgsToActions } from '../../utils';

import { AttachExternalIpMenuItem } from './external-ip-modal';


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
                <MenuItem className="danger" onSelect={this.open}>
                    Delete machine
                </MenuItem>
                <Modal show={this.state.visible}>
                    <Modal.Body>
                        <p>Are you sure you want to delete {this.props.name}?</p>
                        <p><strong>Once deleted, a machine cannot be restored.</strong></p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button bsStyle="danger" onClick={this.onConfirm}>Delete machine</Button>
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
          title={<span>Size details: <code>{props.size.name}</code></span>}>
            <Table striped hover bordered>
                <tbody>
                    <tr>
                        <th>CPUs</th>
                        <td>{props.size.cpus}</td>
                    </tr>
                    <tr>
                        <th>RAM</th>
                        <td>{props.size.ram}MB</td>
                    </tr>
                    <tr>
                        <th>Disk size</th>
                        <td>{props.size.disk}GB</td>
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
            <a className="size-details">{props.size.name}</a>
        </OverlayTrigger>
    );
}

function MachineStatus(props) {
    const statusStyleMap = {
        'BUILD': 'info',
        'ACTIVE': 'success',
        'ERROR': 'danger',
        'OTHER': 'warning'
    };
    const statusTooltip = props.machine.status.details && (
        <Tooltip id={`machine-fault-${props.machine.id}`}>
            {props.machine.status.details}
        </Tooltip>
    );
    return (
        <span className={`machine-status text-${statusStyleMap[props.machine.status.type]}`}>
            {props.machine.status.name}
            {statusTooltip && (
                <OverlayTrigger placement="top" overlay={statusTooltip}>
                    <span>
                        {'\u00A0'}
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

function MachineActionsDropdown(props) {
    const buttonTitle = props.disabled ?
        <span>
            <i className="fa fa-fw fa-spinner fa-pulse" />
            <span className="sr-only">Working...</span>
        </span> :
        'Actions...';
    return (
        <DropdownButton
          id={`machine-actions-${props.machine.id}`}
          bsStyle="default"
          block
          title={buttonTitle}
          pullRight
          disabled={props.disabled}>
            <AttachExternalIpMenuItem
              machine={props.machine}
              externalIps={props.externalIps}
              externalIpActions={props.externalIpActions}
              disabled={!!props.machineExternalIp || !props.machine.nat_allowed} />
            <MenuItem
              onSelect={() => props.externalIpActions.update(
                  props.machineExternalIp,
                  { machine_id: null }
              )}
              disabled={!props.machineExternalIp}>
                Detach external IP
            </MenuItem>
            <MenuItem
              onSelect={props.machineActions.start}
              disabled={props.machine.status.name === 'ACTIVE'}>
                Start machine
            </MenuItem>
            <MenuItem
              onSelect={props.machineActions.stop}
              disabled={props.machine.status.name !== 'ACTIVE'}>
                Stop machine
            </MenuItem>
            <MenuItem
              onSelect={props.machineActions.restart}
              disabled={props.machine.status.name !== 'ACTIVE'}>
                Restart machine
            </MenuItem>
            <ConfirmDeleteMenuItem
              name={props.machine.name}
              onConfirm={props.machineActions.delete} />
        </DropdownButton>
    );
}

function MachineRow(props) {
    const machine = props.machine;
    // Find the external IP for the machine by searching the external IPs
    const externalIp = Object.values(props.externalIps.data || {})
        .find(ip => (ip.machine || {}).id === machine.id);
    const highlightClass = (machine.status.type === 'BUILD') ?
        'info' :
        ((machine.status.type === 'DELETED') ?
            'danger' :
            ((!!machine.updating ||
              !!machine.deleting ||
              !!machine.task ||
              // An updating external IP counts as an action in progress
              !!(externalIp || {}).updating
            ) && 'warning')
        );
    return (
        <tr className={highlightClass || undefined}>
            <td>{machine.name}</td>
            <td>{(machine.image || {}).name || '-'}</td>
            <td>{machine.size ? <MachineSize machine={machine} size={machine.size} /> : '-'}</td>
            <td><MachineStatus machine={machine} /></td>
            <td>{machine.power_state}</td>
            <td>{machine.task ?
                <ProgressBar active striped label={machine.task} now={100} /> :
                '-'
            }</td>
            <td>{machine.internal_ip || '-'}</td>
            <td>{(externalIp || {}).external_ip || '-'}</td>
            <td>{moment(machine.created).fromNow()}</td>
            <td className="resource-actions">
                <MachineActionsDropdown
                  disabled={!!highlightClass}
                  machine={machine}
                  machineExternalIp={(externalIp || {}).external_ip}
                  externalIps={props.externalIps}
                  machineActions={props.machineActions}
                  externalIpActions={props.externalIpActions} />
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
        document.body.classList.remove('resource-page')
    }

    render() {
        // Sort the machines by name to ensure a consistent rendering
        const machines = sortBy(Object.values(this.props.machines), ['name']);
        return (
            <Table striped hover responsive>
                <caption>
                    {machines.length} machine{machines.length !== 1 && 's'}
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
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {machines.map(machine =>
                        <MachineRow
                          key={machine.id}
                          machine={machine}
                          images={this.props.images}
                          sizes={this.props.sizes}
                          externalIps={this.props.externalIps}
                          machineActions={bindArgsToActions(this.props.machineActions, machine.id)}
                          externalIpActions={this.props.externalIpActions} />
                    )}
                </tbody>
            </Table>
        );
    }
}
