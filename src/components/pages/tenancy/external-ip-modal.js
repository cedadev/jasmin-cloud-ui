/**
 * This module contains the React component for the external IP modal.
 */

import React from 'react';
import {
    Modal, Button, Form, Dropdown
} from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';

import { HorizFormGroupContainer } from '../../utils';
import { ExternalIpSelectControl } from './resource-utils';

export class AttachExternalIpMenuItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { visible: false, externalIp: '' };
    }

    open = () => this.setState({ visible: true })

    close = () => this.setState({ visible: false, externalIp: '' })

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSelectChange = (value, { name }) => this.setState({ [name]: value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.externalIpActions.update(
            this.state.externalIp.value,
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
            .filter((ip) => !ip.updating && !ip.machine);
        return (
            <>
                <Dropdown.Item onClick={this.open} disabled={disabled}>
                    Attach external IP
                </Dropdown.Item>
                <Modal
                    backdrop="static"
                    onHide={!externalIps.creating ? this.close : undefined}
                    show={this.state.visible}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Attach external IP to
                            {machine.name}
                        </Modal.Title>
                    </Modal.Header>
                    <Form
                        disabled={!!externalIps.creating}
                        onSubmit={this.handleSubmit}
                    >
                        <Modal.Body>
                            <HorizFormGroupContainer
                                controlId="externalIp"
                                label="External IP"
                                labelWidth={4}
                            >
                                <ExternalIpSelectControl
                                    resource={externalIps}
                                    resourceActions={externalIpActions}
                                    required
                                    value={this.state.externalIp}
                                    onChange={this.handleSelectChange}
                                />
                            </HorizFormGroupContainer>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isEmpty(availableIps)}
                            >
                                <i className="fas fa-check" />
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
