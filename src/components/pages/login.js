/**
 * Module for the login modal.
 */

import React from 'react';
import { Row, Col, PageHeader, FormGroup, FormControl, Button, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

import { Form, Field, ControlContainer, Loading } from '../utils';


class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '' };
    }

    componentWillReceiveProps(nextProps) {
        // If transitioning from authenticating to not authenticating, reset the form
        if( this.props.authenticating && !nextProps.authenticating )
            this.setState({ username: '', password: '' });
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
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    componentDidMount() {
        document.title = 'Sign in | JASMIN Cloud Portal';
        // When the component mounts, reset the error
        this.setState({ error: null });
    }

    componentWillReceiveProps(nextProps) {
        // If transitioning from authenticating to not authenticating, store the error
        if( this.props.authenticating && !nextProps.authenticating )
            this.setState({ error: nextProps.authenticationError });
    }

    render() {
        const { username, initialising, ...formProps } = this.props;
        // If there is an active user, redirect to dashboard
        if( username ) return <Redirect to="/dashboard" />;
        // If we are still initialising, don't render yet
        if( initialising ) return <Loading message="Initialising..." />;
        return (
            <div>
                <PageHeader>Sign in with your JASMIN account</PageHeader>
                <Row>
                    <Col md={8} mdOffset={2}>
                        <div className="banner banner-warning text-center">
                            This is the same username and password as you use to sign
                            in to the JASMIN Accounts Portal.
                        </div>
                    </Col>
                </Row>
                {this.state.error && (
                    <Row>
                        <Col md={6} mdOffset={3}>
                            <div
                              role="notification"
                              className="notification notification-inline notification-danger">
                                <div className="notification-content">{this.state.error.message}</div>
                            </div>
                        </Col>
                    </Row>
                )}
                <Row>
                    <Col md={8} mdOffset={2}>
                        <LoginForm {...formProps} />
                    </Col>
                </Row>
            </div>
        );
    }
}
