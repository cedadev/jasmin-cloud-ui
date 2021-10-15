/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import { Nav, Modal, Button, FormControl } from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';

import { Form, Field } from '../../utils';
import { MachineSelectControl } from './resource-utils';


export class AttachVolumeMenuItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false, machine: '' };
    }

    open = () => this.setState({ visible: true })
    close = () => this.setState({ visible: false, machine: '' })

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.attach(this.state.machine);
        this.close();
    }

    render() {
        const { volume, machines } = this.props;
        return (
            <>
                <Nav.Item onSelect={this.open} disabled={!!volume.machine}>
                    Attach volume to machine
                </Nav.Item>
                <Modal
                  backdrop="static"
                  onHide={this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attach {volume.name} to machine</Modal.Title>
                    </Modal.Header>
                    <Form
                      horizontal
                      disabled={isEmpty(machines.data)}
                      onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <Field name="machine" label="Attach To">
                                <MachineSelectControl
                                  resource={this.props.machines}
                                  required
                                  value={this.state.machine}
                                  onChange={this.handleChange} />
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="primary" type="submit">
                                <i className="fa fa-sign-in" />
                                {'\u00A0'}
                                Attach volume
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </>
        );
    }
}
