/**
 * This module provides the navigation component.
 */

import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';


export class Navigation extends React.Component {
    render() {
        let navContent;
        if( this.props.username ) {
            const title = (
                <span>
                    <i className="fa fa-fw fa-user"></i> {this.props.username}
                </span>
            );
            navContent = (
                <NavDropdown id="user-nav-dropdown" title={title}>
                    <MenuItem onSelect={this.props.signOut}>
                        <i className="fa fa-fw fa-sign-out"></i> Sign Out
                    </MenuItem>
                </NavDropdown>
            );
        }
        else {
            // Prevent the sign in link picking up the active class on the login page
            navContent = (
                <LinkContainer to="/login" isActive={() => false}>
                    <NavItem>Sign In</NavItem>
                </LinkContainer>
            );
        }
        return (
            <Navbar fixedTop collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">JASMIN Cloud Portal</Link>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>{navContent}</Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}
