/**
 * This module contains the modal dialog for machine creation.
 */

import React from 'react';
import { Button, Modal, FormControl } from 'react-bootstrap';

import { Form, Field } from '../../utils';


export class CreateVolumeButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false, name: '', size: '' }
    }

    open = () => this.setState({ visible: true })
    close = () => this.setState({ visible: false, name: '', size: '' })

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.create({ name: this.state.name, size: this.state.size });
        this.close();
    }

    render() {
        return (
            <>
                <Button
                  bsStyle="success"
                  disabled={this.props.creating}
                  onClick={this.open}
                  title="Create a new volume">
                    {this.props.creating ? (
                        <i className="fa fa-spinner fa-pulse" />
                    ) : (
                        <i className="fa fa-database"></i>
                    )}
                    {'\u00A0\u00A0'}
                    { this.props.creating ? 'Creating volume...' : 'New volume' }
                </Button>
                <Modal
                  backdrop="static"
                  onHide={this.close}
                  show={this.state.visible}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new volume</Modal.Title>
                    </Modal.Header>
                    <Form
                      horizontal
                      onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <Field name="name" label="Volume name">
                                <FormControl
                                  placeholder="Volume name"
                                  type="text"
                                  required
                                  pattern="[A-Za-z0-9\.\-_]+"
                                  title="Must contain alphanumeric characters, dot (.), dash (-) and underscore (_) only."
                                  value={this.state.name}
                                  onChange={this.handleChange} />
                            </Field>
                            <Field name="size" label="Size (GB)">
                                <FormControl
                                  placeholder="Volume size (GB)"
                                  type="number"
                                  required
                                  min="1"
                                  step="1"
                                  value={this.state.size}
                                  onChange={this.handleChange} />
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="success" type="submit">
                                <i className="fa fa-plus" />
                                {'\u00A0'}
                                Create volume
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </>
        );
    }
}
