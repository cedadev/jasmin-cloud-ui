/**
 * Module for the login modal.
 */

import React from 'react';
import {
    Form,
    Row,
    Button,
    Alert,
} from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    HorizFormButtonContainer,
    HorizFormGroup,
    Loading,
} from '../utils';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '' };
    }

    componentDidUpdate(prevProps) {
        // If transitioning from authenticating to not authenticating, reset the form
        if (prevProps.authenticating && !this.props.authenticating) {
            this.setState({ username: '', password: '' });
        }
    }

    handleChange = (e) => {
        this.setState({ [e.target.id]: e.target.value });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.authenticate(this.state.username, this.state.password);
    };

    render() {
        const {
            username,
            password,
        } = this.state;
        const {
            authenticating,
        } = this.props;
        return (
            <Form onSubmit={this.handleSubmit}>
                <HorizFormGroup
                    controlId="username"
                    label="Username"
                    type="text"
                    placeholder="Username"
                    required
                    value={username}
                    onChange={this.handleChange}
                />
                <HorizFormGroup
                    controlId="password"
                    label="Password"
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={this.handleChange}
                />
                <HorizFormButtonContainer>
                    { authenticating ? (
                        <Button varient="primary" type="submit">
                            <i className="fas fa-fw fa-spinner fa-pulse" />
                            { ' ' }
                            Signing in...
                        </Button>
                    ) : (
                        <Button varient="primary" type="submit">Sign in</Button>
                    ) }
                </HorizFormButtonContainer>
            </Form>
        );
    }
}
LoginForm.propTypes = {
    authenticating: PropTypes.bool.isRequired,
    authenticate: PropTypes.func.isRequired,
};

export class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    componentDidMount() {
        document.title = 'Sign in | JASMIN Cloud Portal';
        // When the component mounts, reset the error
        if (this.state.error !== null) this.setState({ error: null });
    }

    componentDidUpdate(prevProps) {
        // If transitioning from authenticating to not authenticating, store the error
        if (prevProps.authenticating && !this.props.authenticating) {
            this.setState({ error: this.props.authenticationError });
        }
    }

    render() {
        const { username, initialising, ...formProps } = this.props;
        const { error } = this.state;
        // If there is an active user, redirect to dashboard
        if (username) return <Redirect to="/dashboard" />;
        // If we are still initialising, don't render yet
        if (initialising) return <Loading message="Initialising..." />;
        return (
            <div>
                <Row><h1>Sign in with your JASMIN account</h1></Row>
                <Row>
                    <Alert>
                        This is the same username and password as you use to sign
                        in to the JASMIN Accounts Portal.
                    </Alert>
                </Row>
                {error && (
                    <Row>
                        <Alert variant="warning">
                            <p>{error.message}</p>
                        </Alert>
                    </Row>
                )}
                <Row>
                    <LoginForm {...formProps} />
                </Row>
            </div>
        );
    }
}
LoginPage.propTypes = {
    username: PropTypes.string,
    initialising: PropTypes.bool,
    authenticating: PropTypes.bool,
};
