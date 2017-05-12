/**
 * Module containing the root application component.
 */

import React from 'react';
import { Grid } from 'react-bootstrap';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { store } from './redux';
import { authenticate, signOut } from './redux/session';
import {
    fetchMachines,
    createMachine, startMachine, stopMachine, restartMachine, deleteMachine,
    attachVolume, detachVolume
} from './redux/tenancies';
import { removeNotification } from './redux/notifications';

import { Loading } from './components/utils';
import { Navigation } from './components/navigation';
import { CookielawBanner } from './components/cookielaw';
import { Notifications } from './components/notifications';
import { SplashPage } from './components/pages/splash';
import { LoginPage } from './components/pages/login';
import { Dashboard } from './components/pages/dashboard';
import { TenancyPage } from './components/pages/tenancy';


/**
 * Where components need to be bound to the Redux state, generate the connectors
 */

const ConnectedNav = connect(
    (state) => ({ username: state.session.username }),
    (dispatch) => bindActionCreators({ signOut }, dispatch)
)(Navigation);

const ConnectedNotifications = connect(
    (state) => ({ notifications: state.notifications }),
    (dispatch) => bindActionCreators({ removeNotification }, dispatch)
)(Notifications);

const ConnectedLoginPage = connect(
    (state) => state.session,
    (dispatch) => bindActionCreators({ authenticate }, dispatch)
)(LoginPage);

const ConnectedDashboard = connect(
    (state) => ({ tenancies: state.tenancies }),
)(Dashboard);

const ConnectedTenancyPage = connect(
    (state, props) => ({
        tenancies: state.tenancies,
        tenancyId: props.match.params.id
    }),
    (dispatch) => bindActionCreators({
        fetchMachines,
        createMachine, startMachine, stopMachine, restartMachine, deleteMachine,
        attachVolume, detachVolume
    }, dispatch)
)(TenancyPage);


/**
 * react-router does not play nice when Routes are inside connected components,
 * since it seems to need them to always be rendered
 * Instead, we bind directly to the redux store for our protected routes
 */

class ProtectedRoute extends React.Component {
    constructor(props) {
        super(props)
        this.state = store.getState().session;
    }

    componentDidMount() {
        this.unsubcribe = store.subscribe(() =>
            this.setState(store.getState().session)
        );
    }

    componentWillUnmount() {
        this.unsubcribe()
    }

    render() {
        const { component: Component, ...rest } = this.props;
        const { username, initialising, authenticating } = this.state;
        return (
            <Route {...rest} render={props => (
                (initialising || authenticating) ? (
                    <Loading />
                ) : (
                    username ? (
                        <Component {...props} />
                    ) : (
                        <Redirect to="/login" />
                    )
                )
            )}/>
        );
    }
}

export class Application extends React.Component {
    render() {
        return (
            <Grid>
                <ConnectedNav />
                <CookielawBanner />
                <ConnectedNotifications />
                <Route exact path="/" component={SplashPage} />
                <Route path="/login" component={ConnectedLoginPage} />
                <ProtectedRoute path="/dashboard" component={ConnectedDashboard} />
                <ProtectedRoute path="/tenancies/:id" component={ConnectedTenancyPage} />
            </Grid>
        );
    }
}
