/**
 * This module contains the modal dialog for machine creation.
 */

import React from 'react';
import { Button, Modal, FormControl } from 'react-bootstrap';

import { Form, Field } from '../../utils';


export class CreateMachineModalButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false, name: '', image: '', size: '' }
    }

    open = () => this.setState({ visible: true });
    close = () => this.setState({ visible: false, name: '', image: '', size: '' });

    componentWillReceiveProps(nextProps) {
        // If we are transitioning from creating to not creating, we are done with
        // the modal
        if( this.props.creating && !nextProps.creating ) this.close();
    }

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.createMachine(this.state.name, this.state.image, this.state.size);
    }

    render() {
        const { creating, images, sizes } = this.props;
        return (
            <Button
              bsStyle="success"
              onClick={this.open}>
                <i className="fa fa-desktop"></i>
                {' '}
                New machine
                <Modal backdrop="static" show={this.state.visible}>
                    <Modal.Header>
                        <Modal.Title>Create a new virtual machine</Modal.Title>
                    </Modal.Header>
                    <Form
                      horizontal
                      onSubmit={this.handleSubmit}
                      disabled={creating || images.fetching || sizes.fetching}>
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
                                { images.fetching ? (
                                    <FormControl.Static>
                                        <i className="fa fa-fw fa-spinner fa-pulse" />
                                        { ' ' }
                                        Loading images...
                                    </FormControl.Static>
                                ) : (
                                    <FormControl
                                      componentClass="select"
                                      required
                                      value={this.state.image}
                                      onChange={this.handleChange}>
                                        <option value="">Select an image...</option>
                                        {Object.values(images.data).map(i =>
                                            <option key={i.id} value={i.id}>{i.name}</option>
                                        )}
                                    </FormControl>
                                ) }
                            </Field>
                            <Field name="size" label="Size">
                                { sizes.fetching ? (
                                    <FormControl.Static>
                                        <i className="fa fa-fw fa-spinner fa-pulse" />
                                        { ' ' }
                                        Loading sizes...
                                    </FormControl.Static>
                                ) : (
                                    <FormControl
                                      componentClass="select"
                                      required
                                      value={this.state.size}
                                      onChange={this.handleChange}>
                                        <option value="">Select a size...</option>
                                        {Object.values(sizes.data).map(s =>
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        )}
                                    </FormControl>
                                ) }
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.close} disabled={creating}>Cancel</Button>
                            { creating ? (
                                <Button bsStyle="primary" type="submit">
                                    <i className="fa fa-fw fa-spinner fa-pulse" />
                                    { ' ' }
                                    Creating machine...
                                </Button>
                            ) : (
                                <Button bsStyle="primary" type="submit">Create machine</Button>
                            ) }
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Button>
        );
    }
}
