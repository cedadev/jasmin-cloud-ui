/**
 * This module contains the modal dialog for machine creation.
 */

import React from 'react';
import { Button, Modal, FormControl } from 'react-bootstrap';

import { Form, Field } from '../../utils';
import { ImageSelectControl, SizeSelectControl } from './resource-utils';


export class CreateMachineButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false, name: '', image: '', size: '' }
    }

    open = () => this.setState({ visible: true })
    close = () => this.setState({ visible: false, name: '', image: '', size: '' })

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.create({
            name: this.state.name,
            image_id: this.state.image,
            size_id: this.state.size
        });
        this.close();
    }

    render() {
        const { creating, images, sizes } = this.props;
        return (
            <>
                <Button
                  bsStyle="success"
                  disabled={creating}
                  onClick={this.open}
                  title="Create a new machine">
                    { creating ? (
                        <i className="fa fa-spinner fa-pulse" />
                    ) : (
                        <i className="fa fa-desktop"></i>
                    )}
                    {'\u00A0\u00A0'}
                    { creating ? 'Creating machine...' : 'New machine' }
                </Button>
                <Modal
                  backdrop="static"
                  onHide={this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new machine</Modal.Title>
                    </Modal.Header>
                    <Form horizontal onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <Field name="name" label="Machine name">
                                <FormControl
                                  type="text"
                                  placeholder="Machine name"
                                  required
                                  pattern="[A-Za-z0-9\.\-_]+"
                                  title="Must contain alphanumeric characters, dot (.), dash (-) and underscore (_) only."
                                  value={this.state.name}
                                  onChange={this.handleChange} />
                            </Field>
                            <Field name="image" label="Image">
                                <ImageSelectControl
                                  resource={images}
                                  required
                                  value={this.state.image}
                                  onChange={this.handleChange} />
                            </Field>
                            <Field name="size" label="Size">
                                <SizeSelectControl
                                  resource={sizes}
                                  required
                                  value={this.state.change}
                                  onChange={this.handleChange} />
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="success" type="submit">
                                <i className="fa fa-plus" />
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
