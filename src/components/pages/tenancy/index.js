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
import { ExternalIpsModalButton } from './external-ips-modal';


export class TenancyPage extends React.Component {
    getTenancy(props) {
        const { tenancyId, tenancies: { data: tenancies } } = props;
        if( tenancies === null ) return null;
        return tenancies[tenancyId] || null;  // Convert undefined to null
    }

    setPageTitle(props) {
        const tenancy = this.getTenancy(props);
        if( tenancy ) document.title = `${tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle(this.props)
    componentWillUpdate = (props) => this.setPageTitle(props)

    render() {
        const fetching = this.props.tenancies.fetching;
        const tenancy = this.getTenancy(this.props);
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
                                  createMachine={(...args) => this.props.createMachine(tenancy.id, ...args)} />
                                <ExternalIpsModalButton
                                  machines={tenancy.machines}
                                  externalIps={tenancy.externalIps}
                                  allocateExternalIp={() => this.props.allocateExternalIp(tenancy.id)}
                                  updateExternalIp={(...args) => this.props.updateExternalIp(tenancy.id, ...args)} />
                                <QuotasModalButton
                                  quotas={tenancy.quotas}
                                  fetchQuotas={() => this.props.fetchQuotas(tenancy.id)} />
                                <Button
                                  bsStyle="info"
                                  disabled={!!tenancy.machines.fetching}
                                  onClick={() => this.props.fetchMachines(tenancy.id)}
                                  title="Refresh machine list">
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
                              externalIps={tenancy.externalIps.data}
                              startMachine={(mid) => this.props.startMachine(tenancy.id, mid)}
                              stopMachine={(mid) => this.props.stopMachine(tenancy.id, mid)}
                              restartMachine={(mid) => this.props.restartMachine(tenancy.id, mid)}
                              deleteMachine={(mid) => this.props.deleteMachine(tenancy.id, mid)}
                              attachVolume={(mid, size) => this.props.attachVolume(tenancy.id, mid, size)}
                              detachVolume={(mid, vid) => this.props.detachVolume(tenancy.id, mid, vid)} />
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
