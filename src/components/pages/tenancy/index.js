/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { Nav, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Redirect } from 'react-router-dom';

import get from 'lodash/get';

import { Loading, bindArgsToActions } from '../../utils';

export class TenancyPage extends React.Component {
    // On initial mount or update, trigger a tenancy switch if required
    switchTenancy = () => {
        // If still fetching tenancy data, do nothing
        if (this.props.tenancies.fetching) return;
        // Check the id in the match against the current tenancy
        const matchedId = this.props.match.params.id;
        const currentId = get(this.props.tenancies, 'current.id');
        if (matchedId !== currentId) this.props.tenancyActions.switchTo(matchedId);
    }

    componentDidMount = () => this.switchTenancy()

    componentDidUpdate = () => this.switchTenancy()

    render() {
        const {
            tenancies: { fetching, data: tenancies, current: tenancy },
            tenancyActions
        } = this.props;
        if (get(tenancy, 'id') && get(tenancy, 'name')) {
            // If the tenancy id and name are set, then render
            const boundTenancyActions = {
                quota: bindArgsToActions(tenancyActions.quota, tenancy.id),
                image: bindArgsToActions(tenancyActions.image, tenancy.id),
                size: bindArgsToActions(tenancyActions.size, tenancy.id),
                externalIp: bindArgsToActions(tenancyActions.externalIp, tenancy.id),
                volume: bindArgsToActions(tenancyActions.volume, tenancy.id),
                machine: bindArgsToActions(tenancyActions.machine, tenancy.id),
                clusterType: bindArgsToActions(tenancyActions.clusterType, tenancy.id),
                cluster: bindArgsToActions(tenancyActions.cluster, tenancy.id)
            };
            // We want to show/hide the clusters tab depending on whether
            // clusters are enabled for the tenancy
            const clustersEnabled = get(tenancy, 'clusters.enabled', false);
            return (
                <>
                    <Row><h1>{tenancy.name}</h1></Row>
                    <Row>
                        <Nav variant="tabs" defaultActiveKey={this.props.match.url}>
                            <Nav.Item>
                                <LinkContainer exact to={`/tenancies/${tenancy.id}`}>
                                    <Nav.Link>Overview</Nav.Link>
                                </LinkContainer>
                            </Nav.Item>
                            <Nav.Item>
                                <LinkContainer to={`/tenancies/${tenancy.id}/machines`}>
                                    <Nav.Link>Machines</Nav.Link>
                                </LinkContainer>
                            </Nav.Item>
                            <Nav.Item>
                                <LinkContainer to={`/tenancies/${tenancy.id}/volumes`}>
                                    <Nav.Link>Volumes</Nav.Link>
                                </LinkContainer>
                            </Nav.Item>
                            {clustersEnabled && (
                                <Nav.Item>
                                    <LinkContainer
                                        disabled={!clustersEnabled}
                                        to={`/tenancies/${tenancy.id}/clusters`}
                                    >
                                        <Nav.Link>Clusters</Nav.Link>
                                    </LinkContainer>
                                </Nav.Item>
                            )}
                        </Nav>
                    </Row>
                    {React.Children.map(
                        // Pass the tenancy data to the children
                        this.props.children,
                        (child) => React.cloneElement(child, {
                            tenancy,
                            tenancyActions: boundTenancyActions
                        })
                    )}
                </>
            );
        }
        if (fetching || (tenancies || {}).hasOwnProperty(this.props.match.params.id)) {
            // If fetching tenancies or the matched id is in the tenancy data, allow more time
            return <Loading message="Loading tenancy details..." />;
        }

        // Otherwise redirect
        return <Redirect to="/dashboard" />;
    }
}
