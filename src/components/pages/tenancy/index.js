/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { PageHeader, Nav, NavItem } from 'react-bootstrap';
import { Redirect } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import { Loading, bindArgsToActions } from '../../utils';


export function TenancyPage(props) {
    const {
        tenancyId,
        tenancies: { fetching, data: tenancies },
        tenancyActions
    } = props;
    // Extract the tenancy data for the given ID
    const tenancy = (tenancies || {})[tenancyId];
    if( tenancy ) {
        // Bind the tenancyActions to the tenancyId
        const boundTenancyActions = {
            quota: bindArgsToActions(tenancyActions.quota, tenancyId),
            image: bindArgsToActions(tenancyActions.image, tenancyId),
            size: bindArgsToActions(tenancyActions.size, tenancyId),
            externalIp: bindArgsToActions(tenancyActions.externalIp, tenancyId),
            volume: bindArgsToActions(tenancyActions.volume, tenancyId),
            machine: bindArgsToActions(tenancyActions.machine, tenancyId)
        };
        return (
            <div>
                <PageHeader>{tenancy.name}</PageHeader>
                <Nav bsStyle="tabs" activeHref={props.match.url}>
                    <LinkContainer exact to={`/tenancies/${tenancyId}`}>
                        <NavItem>Overview</NavItem>
                    </LinkContainer>
                    <LinkContainer to={`/tenancies/${tenancyId}/machines`}>
                        <NavItem>Machines</NavItem>
                    </LinkContainer>
                    <LinkContainer to={`/tenancies/${tenancyId}/volumes`}>
                        <NavItem>Volumes</NavItem>
                    </LinkContainer>
                </Nav>
                {React.Children.map(
                    // Pass the tenancy data to the children
                    props.children,
                    child => React.cloneElement(child, {
                        tenancy,
                        tenancyActions: boundTenancyActions
                    })
                )}
            </div>
        );
    }
    else if( fetching ) {
        return <Loading message="Loading tenancy details..." />;
    }
    else {
        return <Redirect to="/dashboard" />;
    }
}
