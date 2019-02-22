/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import { MenuItem, Modal, Button, FormControl } from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';

import { Form, Field, RichSelect } from '../../utils';
import { ExternalIpSelectControl } from './resource-utils';


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
            externalIps,
            externalIpActions,
            disabled
        } = this.props;
        const availableIps = Object.values(externalIps.data || {})
            .filter(ip => !ip.updating && !ip.machine);
        return (
            <>
                <MenuItem onSelect={this.open} disabled={disabled}>
                    Attach external IP
                </MenuItem>
                <Modal
                  backdrop="static"
                  onHide={!externalIps.creating ? this.close : undefined}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attach external IP to {machine.name}</Modal.Title>
                    </Modal.Header>
                    <Form
                      horizontal
                      disabled={!!externalIps.creating}
                      onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <Field name="externalIp" label="External IP">
                                <ExternalIpSelectControl
                                  resource={externalIps}
                                  required
                                  value={this.state.externalIp}
                                  onChange={this.handleChange} />
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                              bsStyle="success"
                              onClick={() => externalIpActions.create()}>
                                {externalIps.creating ? (
                                    <i className="fa fa-spinner fa-pulse" />
                                ) : (
                                    <i className="fa fa-plus" />
                                )}
                                {'\u00A0'}
                                {externalIps.creating ? 'Allocating new IP...' : 'Allocate new IP'}
                            </Button>
                            <Button
                              bsStyle="primary"
                              type="submit"
                              disabled={isEmpty(availableIps)}>
                                <i className="fa fa-check" />
                                {'\u00A0'}
                                Attach IP
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </>
        );
    }
}
