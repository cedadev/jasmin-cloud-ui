/**
 * This module contains the modal dialog for machine volumes.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {
    Table, Button, Modal, FormControl, ControlLabel, InputGroup, Overlay, Popover
} from 'react-bootstrap';

import { Form } from '../../utils';


class AttachVolumeForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = { volumeSize: '' }
    }

    handleVolumeSizeChange = (e) => this.setState({ volumeSize: e.target.value })
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.attachVolume(this.state.volumeSize)
    }

    componentWillReceiveProps(nextProps) {
        // When we transition from attaching to not attaching, reset the state
        if( this.props.attachingVolume && !nextProps.attachingVolume )
            this.setState({ volumeSize: '' });
    }

    render() {
        const { attachingVolume, detachingVolume } = this.props;
        return (
            <Form
              className="volume-add-form"
              disabled={attachingVolume || !!detachingVolume}
              onSubmit={this.handleSubmit}>
                <Table>
                    <tbody>
                        <tr>
                            <td>
                                <ControlLabel htmlFor="volume-size">Attach a volume</ControlLabel>
                            </td>
                            <td>
                                <InputGroup>
                                    <FormControl
                                      id="volume-size"
                                      type="number"
                                      placeholder="Size of volume"
                                      required min={1} step={1}
                                      value={this.state.volumeSize}
                                      onChange={this.handleVolumeSizeChange} />
                                    <InputGroup.Addon>GB</InputGroup.Addon>
                                </InputGroup>
                            </td>
                            <td>
                                <Button
                                  type="submit"
                                  bsStyle="success"
                                  title="Attach volume">
                                    {attachingVolume ? (
                                        <i className="fa fa-fw fa-spinner fa-pulse" />
                                    ) : (
                                        <i className="fa fa-fw fa-plus" />
                                    )}
                                    <span className="sr-only">Attach volume</span>
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Form>
        );
    }
}


class MachineVolumeRow extends React.Component {
    constructor(props) {
        super(props)
        this.state = { confirmDetachVisible: false };
    }

    openConfirmDetach = () => this.setState({ confirmDetachVisible: true })
    closeConfirmDetach = () => this.setState({ confirmDetachVisible: false })

    onConfirmDetach = () => {
        this.props.detachVolume();
        this.closeConfirmDetach();
    }

    render() {
        const { volume, attachingVolume, detachingVolume } = this.props;
        return (
            <tr>
                <td><code>{volume.name}</code></td>
                <td><code>{volume.device}</code></td>
                <td>{volume.size} GB</td>
                <td style={{ width: '1%' }}>
                    <Button
                      ref="target"
                      bsStyle="danger"
                      bsSize="xs"
                      disabled={attachingVolume || !!detachingVolume}
                      onClick={this.openConfirmDetach}>
                        {detachingVolume === volume.id ? (
                            <i className="fa fa-fw fa-spinner fa-pulse" />
                        ) : (
                            <i className="fa fa-fw fa-times" />
                        )}
                        <span className="sr-only">Delete volume</span>
                    </Button>
                    <Overlay
                      show={this.state.confirmDetachVisible}
                      rootClose onHide={this.closeConfirmDetach}
                      placement="left"
                      target={() => ReactDOM.findDOMNode(this.refs.target)}>
                        <Popover
                          id={`confirm-delete-volume-${volume.id}`}
                          title="Are you sure?">
                            <p>Once deleted, a volume cannot be restored.</p>
                            <Button
                              bsStyle="danger" block
                              disabled={attachingVolume || !!detachingVolume}
                              onClick={this.onConfirmDetach}>
                                <i className="fa fa-fw fa-times" />
                                {' '}
                                Delete volume
                            </Button>
                        </Popover>
                    </Overlay>
                </td>
            </tr>
        );
    }
}


export class MachineVolumesModal extends React.Component {
    render() {
        const {
            show, close, volumes,
            attachingVolume, detachingVolume, attachVolume, detachVolume
        } = this.props;
        return (
            <Modal show={show}>
                <Modal.Header>
                    <Modal.Title>Machine volumes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped hover className="volumes-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Device</th>
                                <th>Size</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {volumes.length > 0 ?
                                volumes.map(volume =>
                                    <MachineVolumeRow
                                      key={volume.id}
                                      volume={volume}
                                      attachingVolume={attachingVolume}
                                      detachingVolume={detachingVolume}
                                      detachVolume={() => detachVolume(volume.id)} />
                                ) : (
                                <tr>
                                    <td colSpan={4} className="text-center">
                                        <em className="text-muted">No additional volumes attached.</em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    <AttachVolumeForm
                      attachingVolume={attachingVolume}
                      detachingVolume={detachingVolume}
                      attachVolume={attachVolume} />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                      bsStyle="primary"
                      onClick={close}
                      disabled={attachingVolume || !!detachingVolume}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
