/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { PageHeader, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Redirect } from 'react-router-dom';

import get from 'lodash/get';

import { Loading, bindArgsToActions } from '../../utils';


export class TenancyPage extends React.Component {
    // On initial mount or update, trigger a tenancy switch if required
    switchTenancy = () => {
        // If still fetching tenancy data, do nothing
        if( this.props.tenancies.fetching ) return;
        // Check the id in the match against the current tenancy
        const matchedId = this.props.match.params.id;
        const currentId = get(this.props.tenancies, 'current.id');
        if( matchedId !== currentId )
            this.props.tenancyActions.switchTo(matchedId);
    }
    componentDidMount = () => this.switchTenancy()
    componentDidUpdate = () => this.switchTenancy()

    render() {
        const {
            tenancies: { fetching, data: tenancies, current: tenancy },
            tenancyActions
        } = this.props;
        if( get(tenancy, 'id') && get(tenancy, 'name') ) {
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
            return (
                <div>
                    <PageHeader>{tenancy.name}</PageHeader>
                    <Nav bsStyle="tabs" activeHref={this.props.match.url}>
                        <LinkContainer exact to={`/tenancies/${tenancy.id}`}>
                            <NavItem>Overview</NavItem>
                        </LinkContainer>
                        <LinkContainer to={`/tenancies/${tenancy.id}/machines`}>
                            <NavItem>Machines</NavItem>
                        </LinkContainer>
                        <LinkContainer to={`/tenancies/${tenancy.id}/volumes`}>
                            <NavItem>Volumes</NavItem>
                        </LinkContainer>
                        <LinkContainer
                          to={`/tenancies/${tenancy.id}/clusters`}
                          disabled={!get(tenancy, 'clusters.enabled', false)}>
                            <NavItem>
                                Clusters
                                {get(tenancy, 'clusters.fetching', false) && (
                                    <>
                                        {'\u00A0'}
                                        <i className="fa fa-spinner fa-pulse" />
                                    </>
                                )}
                            </NavItem>
                        </LinkContainer>
                    </Nav>
                    {React.Children.map(
                        // Pass the tenancy data to the children
                        this.props.children,
                        child => React.cloneElement(child, {
                            tenancy,
                            tenancyActions: boundTenancyActions
                        })
                    )}
                </div>
            );
        }
        else if( fetching || (tenancies || {}).hasOwnProperty(this.props.match.params.id) ) {
            // If fetching tenancies or the matched id is in the tenancy data, allow more time
            return <Loading message="Loading tenancy details..." />;
        }
        else {
            // Otherwise redirect
            return <Redirect to="/dashboard" />;
        }
    }
}
