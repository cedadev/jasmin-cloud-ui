/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import {
    Row, Col, PageHeader, Table, ButtonGroup, Button, Modal, FormControl,
    ProgressBar, OverlayTrigger, Tooltip, FormGroup, ControlLabel, InputGroup
} from 'react-bootstrap';
import { Redirect } from 'react-router';

import { Loading, Form, Field, ControlContainer } from '../../utils';

import { MachinesTable } from './machines-table';
import { CreateMachineModal } from './create-machine-modal';
import { QuotasModal } from './quotas-modal';


export class TenancyPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = { createMachineModalVisible: false, quotasModalVisible: false };
    }

    componentWillReceiveProps(nextProps) {
        // If we are transitioning from creating to not creating, hide the
        // create machine modal
        const isCreating = (props) => {
            const { tenancyId, tenancies: { data: tenancies } } = props;
            try {
                return !!tenancies[tenancyId].machines.creating;
            }
            catch(error) {
                if( !(error instanceof TypeError) ) throw error;
                return false;
            }
        }
        if( isCreating(this.props) && !isCreating(nextProps) )
            this.closeCreateMachineModal();
    }

    openCreateMachineModal = () => this.setState({ createMachineModalVisible: true })
    closeCreateMachineModal = () => this.setState({ createMachineModalVisible: false })

    openQuotasModal = () => this.setState({ quotasModalVisible: true })
    closeQuotasModal = () => this.setState({ quotasModalVisible: false })

    createMachine = (name, image, size) => {
        this.props.createMachine(this.props.tenancyId, name, image, size);
    }

    refreshMachines = () => this.props.fetchMachines(this.props.tenancyId)

    render() {
        const { tenancyId, tenancies: { fetching, data: tenancies } } = this.props;
        const tenancy = tenancies[tenancyId];
        if( tenancy ) {
            return (
                <div>
                    <PageHeader>
                        Available machines{' '}
                        <small>{tenancy.name}</small>
                    </PageHeader>
                    <Row>
                        <Col md={12}>
                            <ButtonGroup className="pull-right">
                                <Button
                                  bsStyle="success"
                                  onClick={this.openCreateMachineModal}>
                                    <i className="fa fa-fw fa-desktop"></i>
                                    {' '}
                                    New machine
                                </Button>
                                <Button
                                  bsStyle="warning"
                                  onClick={this.openQuotasModal}>
                                    <i className="fa fa-fw fa-pie-chart"></i>
                                    {' '}
                                    Quotas
                                </Button>
                                <Button
                                  bsStyle="info"
                                  onClick={this.refreshMachines}>
                                    <i className="fa fa-fw fa-refresh"></i>
                                    {' '}
                                    Refresh
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <MachinesTable
                              machines={tenancy.machines}
                              startMachine={(mid) => this.props.startMachine(tenancyId, mid)}
                              stopMachine={(mid) => this.props.stopMachine(tenancyId, mid)}
                              restartMachine={(mid) => this.props.restartMachine(tenancyId, mid)}
                              deleteMachine={(mid) => this.props.deleteMachine(tenancyId, mid)}
                              attachVolume={(mid, size) => this.props.attachVolume(tenancyId, mid, size)}
                              detachVolume={(mid, vid) => this.props.detachVolume(tenancyId, mid, vid)} />
                        </Col>
                    </Row>
                    <CreateMachineModal
                      show={this.state.createMachineModalVisible}
                      close={this.closeCreateMachineModal}
                      creating={!!tenancy.machines.creating}
                      images={tenancy.images}
                      sizes={tenancy.sizes}
                      createMachine={this.createMachine} />
                    <QuotasModal
                      show={this.state.quotasModalVisible}
                      close={this.closeQuotasModal}
                      quotas={tenancy.quotas} />
                </div>
            );
        }
        else if( fetching ) {
            return <Loading />;
        }
        else {
            return <Redirect to="/dashboard" />;
        }
    }
}
