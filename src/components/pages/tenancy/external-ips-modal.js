/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, FormControl, Table } from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';
import at from 'lodash/at';

import { Loading, Form, Field } from '../../utils';


export class ExternalIpsModalButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false, externalIp: '', machineId: '' };
    }

    open = () => this.setState({ visible: true })
    close = () => this.setState({ visible: false, externalIp: '', machineId: '' })

    componentWillReceiveProps(nextProps) {
        // If transitioning from updating to not updating, the modal is done
        if( this.props.externalIps.updating && !nextProps.externalIps.updating )
            this.close();
    }

    handleExternalIpChange = (event) => {
        // Find the current mapping for the selected IP
        const externalIp = event.target.value;
        const machineId = at(
            this.props.externalIps.data, `['${externalIp}']`
        )[0] || '';
        this.setState({ externalIp, machineId });
    }

    handleMachineIdChange = (event) => this.setState({ machineId: event.target.value })

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.updateExternalIp(
            this.state.externalIp,
            this.state.machineId !== '' ? this.state.machineId : null
        );
    }

    render() {
        const {
            allocating = false,
            updating = false,
            data: externalIps
        } = this.props.externalIps;
        const machinesById = this.props.machines.data;
        // Sort the machines by name
        const machines = Object.values(machinesById || {});
        machines.sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
        const ready = externalIps && machinesById;
        return (
            <Button
              title="Attach external IP to machine"
              bsStyle="default"
              onClick={this.open}>
                <i className="fa fa-globe" />
                {' '}
                External IPs
                <Modal
                  backdrop="static"
                  onHide={allocating || updating ? undefined : this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attach external IP to machine</Modal.Title>
                    </Modal.Header>
                    <Form
                      horizontal
                      disabled={allocating || updating}
                      onSubmit={this.handleSubmit}>
                        { ready ? (
                            <Modal.Body>
                                <Field name="externalIp" label="External IP">
                                    {isEmpty(externalIps) ? (
                                        <FormControl componentClass="select" disabled>
                                            <option value="">No external IPs allocated</option>
                                        </FormControl>
                                    ) : (
                                        <FormControl
                                          componentClass="select"
                                          required
                                          value={this.state.externalIp}
                                          onChange={this.handleExternalIpChange}>
                                            <option value="">Select an external IP...</option>
                                            {Object.keys(externalIps).map(ip =>
                                                <option key={ip} value={ip}>{ip}</option>
                                            )}
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="machineId" label="Attach To">
                                    {!!this.state.externalIp ? (
                                        <FormControl
                                          componentClass="select"
                                          value={this.state.machineId}
                                          onChange={this.handleMachineIdChange}>
                                            <option value="">Not attached</option>
                                            {machines.map(m =>
                                                <option
                                                  key={m.id}
                                                  value={m.id}
                                                  disabled={!m.internal_ip || !m.nat_allowed}>
                                                    {m.name}: {m.internal_ip || '-'}
                                                </option>
                                            )}
                                        </FormControl>
                                    ) : (
                                        <FormControl componentClass="select" disabled>
                                            <option value="">Select an external IP...</option>
                                        </FormControl>
                                    )}
                                </Field>
                            </Modal.Body>
                        ) : (
                            <Modal.Body><Loading /></Modal.Body>
                        ) }
                        <Modal.Footer>
                            <Button
                              bsStyle="success"
                              disabled={!ready}
                              onClick={this.props.allocateExternalIp}>
                                {allocating ? (
                                    <i className="fa fa-spinner fa-pulse" />
                                ) : (
                                    <i className="fa fa-plus" />
                                )}
                                {' '}
                                {allocating ? 'Allocating new IP...' : 'Allocate new IP'}
                            </Button>
                            <Button
                              bsStyle="primary"
                              type="submit"
                              disabled={!ready}>
                                {updating ? (
                                    <i className="fa fa-spinner fa-pulse" />
                                ) : (
                                    <i className="fa fa-check" />
                                )}
                                {' '}
                                {updating ? 'Updating...' : 'Update'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Button>
        );
    }
}
