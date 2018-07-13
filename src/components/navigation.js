/**
 * This module provides the navigation component.
 */

import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';


export const Navigation = (props) => {
    const tenancies = Object.values(props.tenancies || {})
        .sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
    return (
        <Navbar fixedTop collapseOnSelect>
            <Navbar.Header>
                <Navbar.Brand>
                    <Link to="/">JASMIN Cloud Portal</Link>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            {props.username ? (
                <Navbar.Collapse>
                    <Nav>
                        <NavDropdown title="My Tenancies" id="tenancies-dropdown">
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
                    <Navbar.Text pullRight>
                        Signed in as <strong>{props.username}</strong>
                        {'\u00A0'}
                        (<Navbar.Link onClick={props.signOut}>sign out</Navbar.Link>)
                    </Navbar.Text>
                </Navbar.Collapse>
            ) : (
                <Navbar.Collapse>
                    <Nav pullRight>
                        <LinkContainer to="/login" isActive={() => false}>
                            <NavItem>Sign In</NavItem>
                        </LinkContainer>
                    </Nav>
                </Navbar.Collapse>
            )}
        </Navbar>
    );
};
