/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MenuItem, Modal, Button, FormControl } from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';

import { Loading, Form, Field, RichSelect } from '../../utils';


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
            <MenuItem onSelect={this.open} disabled={!!volume.machine}>
                Attach volume to machine
                <Modal
                  backdrop="static"
                  onHide={this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attach {volume.name} to machine</Modal.Title>
                    </Modal.Header>
                    <Form
                      horizontal
                      onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <Field name="machine" label="Attach To">
                                { machines.data ? (
                                    <FormControl
                                      componentClass={RichSelect}
                                      disabled={isEmpty(machines.data)}
                                      required
                                      value={this.state.machine}
                                      onChange={this.handleChange}>
                                        {isEmpty(machines.data) ? (
                                            <option value="">No machines available</option>
                                        ) : (
                                            <option value="">Select a machine...</option>
                                        )}
                                        {Object.values(machines.data).map(machine =>
                                            <option key={machine.id} value={machine.id}>{machine.name}</option>
                                        )}
                                    </FormControl>
                                ) : (
                                    machines.fetching ? (
                                        <FormControl.Static>
                                            <i className="fa fa-spinner fa-pulse" />
                                            {'\u00A0'}
                                            Loading machines...
                                        </FormControl.Static>
                                    ) : (
                                        <FormControl.Static className="text-danger">
                                            <i className="fa fa-exclamation-triangle" />
                                            {'\u00A0'}
                                            Failed to load machines
                                        </FormControl.Static>
                                    )
                                ) }
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
            </MenuItem>
        );
    }
}
