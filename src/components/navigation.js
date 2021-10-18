/**
 * This module provides the navigation component.
 */

import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Container} from 'react-bootstrap';
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
        <Container>
        <Navbar.Brand><Link to="/">JASMIN Cloud Portal</Link></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
        {currentCloud && clouds && (
            <NavDropdown title={currentCloud.label} id="clouds-dropdown">
            {clouds.map(c =>
                <NavDropdown.Item key={c.name} href={c.url}>{c.label}</NavDropdown.Item>
            )}
            </NavDropdown>
        )}
        {currentTenancy && tenancies && (
            <NavDropdown title={currentTenancy.name} id="tenancies-dropdown">
            {tenancies.map(t =>
                <NavDropdown.Item href={`/tenancies/${t.id}`}>{t.name}</NavDropdown.Item>
            )}
            </NavDropdown>
        )}
        {props.username ? (
            <Navbar.Text pullRight>
            Signed in as <strong>{props.username}</strong>
            {'\u00A0'}
            (<Nav.Link onClick={props.signOut}>sign out</Nav.Link>)
            </Navbar.Text>
        ) : (
            <Nav.Link href="/login">Sign In</Nav.Link>
        )}
        </Nav>
        </Navbar.Collapse>
        </Container>
        </Navbar>
    );
};
