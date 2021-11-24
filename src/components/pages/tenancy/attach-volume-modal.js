/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import {
    Modal, Button, Dropdown, Form
} from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';

import { HorizFormGroupContainer } from '../../utils';
import { MachineSelectControl } from './resource-utils';

export class AttachVolumeMenuItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { visible: false, machine: '' };
    }

    open = () => this.setState({ visible: true })

    close = () => this.setState({ visible: false, machine: '' })

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSelectChange = (value, { name }) => this.setState({ [name]: value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.attach(this.state.machine.value);
        this.close();
    }

    render() {
        const { volume, machines } = this.props;
        return (
            <>
                <Dropdown.Item onClick={this.open} disabled={!!volume.machine}>
                    Attach volume to machine
                </Dropdown.Item>
                <Modal
                    backdrop="static"
                    onHide={this.close}
                    show={this.state.visible}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Attach
                            {' '}
                            {volume.name}
                            {' '}
                            to machine
                        </Modal.Title>
                    </Modal.Header>
                    <Form
                        disabled={isEmpty(machines.data)}
                        onSubmit={this.handleSubmit}
                    >
                        <Modal.Body>
                            <HorizFormGroupContainer
                                labelWidth={3}
                                controlId="machine"
                                label="Attach To"
                            >
                                <MachineSelectControl
                                    resource={this.props.machines}
                                    required
                                    value={this.state.machine}
                                    onChange={this.handleSelectChange}
                                />
                            </HorizFormGroupContainer>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" type="submit">
                                <i className="fas fa-sign-in-alt" />
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
