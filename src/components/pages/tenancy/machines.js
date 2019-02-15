/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap';

import { Loading } from '../../utils';

import { CreateMachineButton } from './create-machine-modal';
import { MachinesTable } from './machines-table';


export class TenancyMachinesPanel extends React.Component {
    setPageTitle(props) {
        document.title = `Machines | ${props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle(this.props)
    componentDidUpdate = (props) => this.setPageTitle(props)

    render() {
        const { fetching, data: machines, creating = false } = this.props.tenancy.machines;
        return (
            machines ? (
                <div>
                    <Row>
                        <Col md={12}>
                            <ButtonGroup className="pull-right">
                                <CreateMachineButton
                                  creating={creating}
                                  images={this.props.tenancy.images}
                                  sizes={this.props.tenancy.sizes}
                                  create={this.props.tenancyActions.machine.create} />
                                <Button
                                  bsStyle="info"
                                  disabled={fetching}
                                  onClick={() => this.props.tenancyActions.machine.fetchList()}
                                  title="Refresh machine list">
                                    <i className={`fa fa-refresh ${fetching ? 'fa-spin' : ''}`}></i>
                                    {'\u00A0'}
                                    Refresh
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <MachinesTable
                              machines={machines}
                              images={this.props.tenancy.images.data || {}}
                              sizes={this.props.tenancy.sizes.data || {}}
                              externalIps={this.props.tenancy.externalIps}
                              machineActions={this.props.tenancyActions.machine}
                              externalIpActions={this.props.tenancyActions.externalIp} />
                        </Col>
                    </Row>
                </div>
            ) : (
                <Row>
                    <Col md={6} mdOffset={3}>
                        {fetching ? (
                            <Loading message="Loading machines..."/>
                        ) : (
                            <div
                              role="notification"
                              className="notification notification-inline notification-danger">
                                <div className="notification-content">Unable to load machines</div>
                            </div>
                        )}
                    </Col>
                </Row>
            )
        );
    }
}
