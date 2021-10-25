/**
 * This module provides the navigation component.
 */

import React from 'react';
import {
    Navbar,
    Nav,
    NavDropdown,
    Container
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import get from 'lodash/get';

export const Navigation = (props) => {
    const currentCloud = get(props.clouds, props.currentCloud);
    const clouds = Object.entries(props.clouds || {})
        .map(([name, cloud]) => ({ name, ...cloud }))
        .filter((cloud) => cloud.name !== props.currentCloud)
        .sort((x, y) => (x.label < y.label ? -1 : x.label > y.label ? 1 : 0));
    const { currentTenancy } = props;
    const tenancies = Object.values(props.tenancies || {})
        .filter((tenancy) => tenancy.id !== get(currentTenancy, 'id'))
        .sort((x, y) => (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
    return (
        <Navbar sticky="top" variant="dark" bg="success">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <img
                            src="//cdn.jsdelivr.net/gh/cedadev/orgtheme-jasmin@v0.6-beta1/orgtheme_jasmin/static/orgtheme/assets/img/jasmin_logo_white_greendots_h50.png"
                            alt="JASMIN logo"
                        />
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {currentCloud && clouds && (
                            <NavDropdown title={currentCloud.label} id="clouds-dropdown">
                                {clouds.map((c) => (
                                    <LinkContainer to={c.url}>
                                        <NavDropdown.Item key={c.name}>
                                            {c.label}
                                        </NavDropdown.Item>
                                    </LinkContainer>
                                ))}
                            </NavDropdown>
                        )}
                        {currentTenancy && tenancies && (
                            <NavDropdown title={currentTenancy.name} id="tenancies-dropdown">
                                {tenancies.map((t) => (
                                    <LinkContainer to={`/tenancies/${t.id}`}>
                                        <NavDropdown.Item>
                                            {t.name}
                                        </NavDropdown.Item>
                                    </LinkContainer>
                                ))}
                            </NavDropdown>
                        )}
                    </Nav>
                    <Nav className="ms-auto">
                        {props.username ? (
                            <NavDropdown title={props.username} id="user-dropdown">
                                <NavDropdown.Item
                                    onClick={props.signOut}
                                >
                                    Sign out
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <LinkContainer to="/login">
                                <Nav.Link>Sign In</Nav.Link>
                            </LinkContainer>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
