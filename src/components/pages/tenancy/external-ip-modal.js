/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MenuItem, Modal, Button, FormControl } from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';

import { Loading, Form, Field, RichSelect } from '../../utils';


export class AttachExternalIpMenuItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false, externalIp: '' };
    }

    open = () => this.setState({ visible: true })
    close = () => this.setState({ visible: false, externalIp: '' })

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.externalIpActions.update(
            this.state.externalIp,
            { machine_id: this.props.machine.id }
        );
        this.close();
    }

    render() {
        const {
            machine,
            machineExternalIp,
            externalIps: { creating, fetching, data: externalIps },
            externalIpActions
        } = this.props;
        const availableIps = Object.values(externalIps || {})
            .filter(ip => !ip.updating && !ip.machine)
            .map(ip => ip.external_ip);
        return (
            <MenuItem
              onSelect={this.open}
              disabled={!!machineExternalIp || !machine.nat_allowed}>
                Attach external IP
                <Modal
                  backdrop="static"
                  onHide={!!creating ? undefined : this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attach external IP to {machine.name}</Modal.Title>
                    </Modal.Header>
                    <Form
                      horizontal
                      disabled={!!creating}
                      onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <Field name="externalIp" label="External IP">
                                { externalIps ? (
                                    <FormControl
                                      componentClass={RichSelect}
                                      disabled={isEmpty(availableIps)}
                                      required
                                      value={this.state.externalIp}
                                      onChange={this.handleChange}>
                                        {isEmpty(availableIps) ? (
                                            <option value="">No external IPs available</option>
                                        ) : (
                                            <option value="">Select an external IP...</option>
                                        )}
                                        {availableIps.map(ip =>
                                            <option key={ip} value={ip}>{ip}</option>
                                        )}
                                    </FormControl>
                                ) : (
                                    fetching ? (
                                        <FormControl.Static>
                                            <i className="fa fa-spinner fa-pulse" />
                                            {'\u00A0'}
                                            Loading external IPs...
                                        </FormControl.Static>
                                    ) : (
                                        <FormControl.Static className="text-danger">
                                            <i className="fa fa-exclamation-triangle" />
                                            {'\u00A0'}
                                            Failed to load external IPs
                                        </FormControl.Static>
                                    )
                                ) }
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                              bsStyle="success"
                              disabled={!!creating}
                              onClick={() => externalIpActions.create()}>
                                {creating ? (
                                    <i className="fa fa-spinner fa-pulse" />
                                ) : (
                                    <i className="fa fa-plus" />
                                )}
                                {'\u00A0'}
                                {creating ? 'Allocating new IP...' : 'Allocate new IP'}
                            </Button>
                            <Button
                              bsStyle="primary"
                              type="submit"
                              disabled={!!creating}>
                                <i className="fa fa-check" />
                                {'\u00A0'}
                                Attach IP
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </MenuItem>
        );
    }
}
