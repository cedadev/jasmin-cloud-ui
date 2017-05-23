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
import { CreateMachineModalButton } from './create-machine-modal';
import { QuotasModalButton } from './quotas-modal';


export class TenancyPage extends React.Component {
    setPageTitle(props) {
        const { tenancyId, tenancies: { fetching, data: tenancies } } = props;
        const tenancy = tenancies[tenancyId];
        if( tenancy ) {
            document.title = `${tenancy.name} | JASMIN Cloud Portal`;
        }
    }

    componentDidMount = () => this.setPageTitle(this.props)
    componentWillUpdate = (props) => this.setPageTitle(props)

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
                                <CreateMachineModalButton
                                  creating={!!tenancy.machines.creating}
                                  images={tenancy.images}
                                  sizes={tenancy.sizes}
                                  createMachine={(...args) => this.props.createMachine(tenancyId, ...args)} />
                                <QuotasModalButton
                                  quotas={tenancy.quotas}
                                  fetchQuotas={() => this.props.fetchQuotas(tenancyId)} />
                                <Button
                                  bsStyle="info"
                                  disabled={!!tenancy.machines.fetching}
                                  onClick={() => this.props.fetchMachines(tenancyId)}>
                                    <i className="fa fa-refresh"></i>
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
