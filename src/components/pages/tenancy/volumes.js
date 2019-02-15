/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap';

import { Loading } from '../../utils';

import { CreateVolumeButton } from './create-volume-modal';
import { VolumesTable } from './volumes-table';


export class TenancyVolumesPanel extends React.Component {
    setPageTitle(props) {
        document.title = `Volumes | ${props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle(this.props)
    componentDidUpdate = (props) => this.setPageTitle(props)

    render() {
        const { fetching, data: volumes, creating = false } = this.props.tenancy.volumes;
        return (
            volumes ? (
                <div>
                    <Row>
                        <Col md={12}>
                            <ButtonGroup className="pull-right">
                                <CreateVolumeButton
                                  creating={creating}
                                  create={this.props.tenancyActions.volume.create} />
                                <Button
                                  bsStyle="info"
                                  disabled={fetching}
                                  onClick={() => this.props.tenancyActions.volume.fetchList()}
                                  title="Refresh volume list">
                                    <i className={`fa fa-refresh ${fetching ? 'fa-spin' : ''}`}></i>
                                    {'\u00A0'}
                                    Refresh
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <VolumesTable
                              volumes={volumes}
                              machines={this.props.tenancy.machines}
                              volumeActions={this.props.tenancyActions.volume} />
                        </Col>
                    </Row>
                </div>
            ) : (
                <Row>
                    <Col md={6} mdOffset={3}>
                        {fetching ? (
                            <Loading message="Loading volumes..."/>
                        ) : (
                            <div
                              role="notification"
                              className="notification notification-inline notification-danger">
                                <div className="notification-content">Unable to load volumes</div>
                            </div>
                        )}
                    </Col>
                </Row>
            )
        );
    }
}
