/**
 * This module provides the navigation component.
 */

import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import get from 'lodash/get';


export const Navigation = (props) => {
    const currentCloud = get(props.clouds, props.currentCloud);
    const clouds = Object.entries(props.clouds || {})
        .map(([name, cloud]) => ({ name, ...cloud }))
        .filter(cloud => cloud.name !== props.currentCloud)
        .sort((x, y) => x.label < y.label ? -1 : (x.label > y.label ? 1 : 0));
    const currentTenancy = props.currentTenancy;
    const tenancies = Object.values(props.tenancies || {})
        .filter(tenancy => tenancy.id !== get(currentTenancy, 'id'))
        .sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
    return (
        <Navbar fixedTop collapseOnSelect>
            <Navbar.Header>
                <Navbar.Brand>
                    <Link to="/">VIO7 JASMIN Cloud Portal</Link>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                {currentCloud && clouds && (
                    <Nav>
                        <NavDropdown title={currentCloud.label} id="clouds-dropdown">
                            {clouds.map(c =>
                                <MenuItem key={c.name} href={c.url}>{c.label}</MenuItem>
                            )}
                        </NavDropdown>
                    </Nav>
                )}
                {currentTenancy && tenancies && (
                    <Nav>
                        <NavDropdown title={currentTenancy.name} id="tenancies-dropdown">
                            {tenancies.map(t =>
                                <LinkContainer
                                  key={t.id}
                                  to={`/tenancies/${t.id}`}
                                  isActive={() => false}>
                                    <MenuItem>{t.name}</MenuItem>
                                </LinkContainer>
                            )}
                        </NavDropdown>
                    </Nav>
                )}
                {props.username ? (
                    <Navbar.Text pullRight>
                        Signed in as <strong>{props.username}</strong>
                        {'\u00A0'}
                        (<Navbar.Link onClick={props.signOut}>sign out</Navbar.Link>)
                    </Navbar.Text>
                ) : (
                    <Nav pullRight>
                        <LinkContainer to="/login" isActive={() => false}>
                            <NavItem>Sign In</NavItem>
                        </LinkContainer>
                    </Nav>
                )}
            </Navbar.Collapse>
        </Navbar>
    );
};
