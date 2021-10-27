/**
 * This module contains the modal dialog for machine creation.
 */

import React from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

import { HorizFormGroup, HorizFormGroupContainer } from '../../utils';
import { ImageSelectControl, SizeSelectControl } from './resource-utils';

export class CreateMachineButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false, name: '', image: '', size: ''
        };
    }

    open = () => this.setState({ visible: true })

    close = () => this.setState({
        visible: false, name: '', image: '', size: ''
    })

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSelectChange = (value, { name }) => this.setState({ [name]: value });

    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state);
        this.props.create({
            name: this.state.name,
            image_id: this.state.image.value,
            size_id: this.state.size.value,
        });
        this.close();
    }

    render() {
        const { creating, images, sizes } = this.props;
        return (
            <>
                <Button
                    variant="success"
                    disabled={creating}
                    onClick={this.open}
                    title="Create a new machine"
                    className="text-white"
                >
                    { creating ? (
                        <i className="fas fa-spinner fa-pulse" />
                    ) : (
                        <i className="fas fa-desktop" />
                    )}
                    {'\u00A0\u00A0'}
                    { creating ? 'Creating machine...' : 'New machine' }
                </Button>
                <Modal
                    backdrop="static"
                    onHide={this.close}
                    show={this.state.visible}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new machine</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <HorizFormGroup
                                controlId="name"
                                label="Machine name"
                                labelWidth={4}
                                type="text"
                                placeholder="Machine name"
                                required
                                pattern="[A-Za-z0-9\.\-_]+"
                                title="Must contain alphanumeric characters, dot (.), dash (-) and underscore (_) only."
                                value={this.state.name}
                                onChange={this.handleChange}
                            />
                            <HorizFormGroupContainer controlId="image" label="Image" labelWidth={4}>
                                <ImageSelectControl
                                    resource={images}
                                    required
                                    value={this.state.image}
                                    onChange={this.handleSelectChange}
                                />
                            </HorizFormGroupContainer>
                            <HorizFormGroupContainer controlId="size" label="Size" labelWidth={4}>
                                <SizeSelectControl
                                    resource={sizes}
                                    required
                                    value={this.state.change}
                                    onChange={this.handleSelectChange}
                                />
                            </HorizFormGroupContainer>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="success" type="submit">
                                <i className="fas fa-plus" />
                                {'\u00A0'}
                                Create machine
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </>
        );
    }
}
