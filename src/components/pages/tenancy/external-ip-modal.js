/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import { Nav, Modal, Button, FormControl } from 'react-bootstrap';

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
                <Nav.Item onSelect={this.open} disabled={disabled}>
                    Attach external IP
                </Nav.Item>
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
                                  resourceActions={externalIpActions}
                                  required
                                  value={this.state.externalIp}
                                  onChange={this.handleChange} />
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
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
