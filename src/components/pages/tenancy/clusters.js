/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap';

import { Loading } from '../../utils';

import { ClustersTable } from './clusters-table';
import { CreateClusterButton } from './create-cluster-modal';


export class TenancyClustersPanel extends React.Component {
    setPageTitle(props) {
        document.title = `Clusters | ${props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle(this.props)
    componentDidUpdate = (props) => this.setPageTitle(props)

    render() {
        const { fetching, data: clusters, creating = false } = this.props.tenancy.clusters;
        return (
            clusters ? (
                <div>
                    <Row>
                        <Col md={12}>
                            <ButtonGroup className="pull-right">
                                <CreateClusterButton
                                  creating={creating}
                                  clusterTypes={this.props.tenancy.clusterTypes}
                                  create={this.props.tenancyActions.cluster.create} />
                                <Button
                                  bsStyle="info"
                                  disabled={fetching}
                                  onClick={() => this.props.tenancyActions.cluster.fetchList()}
                                  title="Refresh cluster list">
                                    <i className={`fa fa-refresh ${fetching ? 'fa-spin' : ''}`}></i>
                                    {'\u00A0'}
                                    Refresh
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <ClustersTable
                              clusters={clusters}
                              clusterActions={this.props.tenancyActions.cluster} />
                        </Col>
                    </Row>
                </div>
            ) : (
                <Row>
                    <Col md={6} mdOffset={3}>
                        {fetching ? (
                            <Loading message="Loading clusters..."/>
                        ) : (
                            <div
                              role="notification"
                              className="notification notification-inline notification-danger">
                                <div className="notification-content">Unable to load clusters</div>
                            </div>
                        )}
                    </Col>
                </Row>
            )
        );
    }
}
