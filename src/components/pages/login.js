/**
 * Module for the login modal.
 */

import React from 'react';
import { Row, Col, PageHeader, FormGroup, FormControl, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

import { Form, Field, ControlContainer, Loading } from '../utils';


class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '' };
    }

    handleChange = (e) => this.setState({ [e.target.id]: e.target.value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.authenticate(this.state.username, this.state.password);
    }

    render() {
        return (
            <div>
                <Form
                    horizontal
                    disabled={this.props.authenticating}
                    onSubmit={this.handleSubmit}>
                    <Field name="username" label="Username">
                        <FormControl
                            type="text"
                            placeholder="Username"
                            required
                            value={this.state.username}
                            onChange={this.handleChange} />
                    </Field>
                    <Field name="password" label="Password">
                        <FormControl
                            type="password"
                            placeholder="Password"
                            required
                            value={this.state.password}
                            onChange={this.handleChange} />
                    </Field>
                    <FormGroup>
                        <ControlContainer>
                            { this.props.authenticating ? (
                                <Button bsStyle="primary" type="submit">
                                    <i className="fa fa-fw fa-spinner fa-pulse" />
                                    { ' ' }
                                    Signing in...
                                </Button>
                            ) : (
                                <Button bsStyle="primary" type="submit">Sign in</Button>
                            ) }
                        </ControlContainer>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}


export class LoginPage extends React.Component {
    componentDidMount() {
        document.title = 'Sign in | JASMIN Cloud Portal';
    }

    render() {
        const { username, initialising, ...rest } = this.props;
        // If there is an active user, redirect to dashboard
        if( username ) return <Redirect to="/dashboard" />;
        // If we are still initialising, don't render yet
        if( initialising ) return <Loading />;
        return (
            <div>
                <PageHeader>Sign in with your JASMIN account</PageHeader>
                <Row>
                    <Col md={8} mdOffset={2}>
                        <div className="banner banner-warning text-center">
                            This is the same username and password as you use to sign
                            in to the JASMIN Accounts Portal.
                        </div>
                        <LoginForm {...rest} />
                    </Col>
                </Row>
            </div>
        );
    }
}
