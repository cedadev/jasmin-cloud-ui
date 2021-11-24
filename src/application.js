/**
 * Module containing the root application component.
 */

import React from 'react';
import { Container } from 'react-bootstrap';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as sessionActions } from './redux/session';
import { actionCreators as tenancyActions } from './redux/tenancies';
import { actionCreators as notificationActions } from './redux/notifications';

import { Navigation } from './components/navigation';
import { CookielawBanner } from './components/cookielaw';
import { Notifications } from './components/notifications';
import { SplashPage } from './components/pages/splash';
import { LoginPage } from './components/pages/login';
import { Dashboard } from './components/pages/dashboard';
import { TenancyPage } from './components/pages/tenancy';
import { TenancyOverviewPanel } from './components/pages/tenancy/overview';
import { TenancyMachinesPanel } from './components/pages/tenancy/machines';
import { TenancyVolumesPanel } from './components/pages/tenancy/volumes';
import { TenancyClustersPanel } from './components/pages/tenancy/clusters';

/**
 * Where components need to be bound to the Redux state, generate the connectors
 */

const ConnectedNav = connect(
    (state) => ({
        username: state.session.username,
        tenancies: state.tenancies.data,
        currentTenancy: state.tenancies.current,
        clouds: state.clouds.available_clouds,
        currentCloud: state.clouds.current_cloud
    }),
    (dispatch) => bindActionCreators({
        signOut: sessionActions.signOut
    }, dispatch)
)(Navigation);

const ConnectedNotifications = connect(
    (state) => ({ notifications: state.notifications }),
    (dispatch) => ({
        notificationActions: bindActionCreators(notificationActions, dispatch)
    })
)(Notifications);

const ConnectedLoginPage = connect(
    (state) => state.session,
    (dispatch) => bindActionCreators({
        authenticate: sessionActions.authenticate
    }, dispatch)
)(LoginPage);

const ConnectedDashboard = connect(
    (state) => ({ tenancies: state.tenancies })
)(Dashboard);

const ConnectedTenancyPage = connect(
    (state) => ({ tenancies: state.tenancies }),
    (dispatch) => ({
        tenancyActions: {
            switchTo: (tenancyId) => dispatch(tenancyActions.switchTo(tenancyId)),
            quota: bindActionCreators(tenancyActions.quota, dispatch),
            image: bindActionCreators(tenancyActions.image, dispatch),
            size: bindActionCreators(tenancyActions.size, dispatch),
            externalIp: bindActionCreators(tenancyActions.externalIp, dispatch),
            volume: bindActionCreators(tenancyActions.volume, dispatch),
            machine: bindActionCreators(tenancyActions.machine, dispatch),
            clusterType: bindActionCreators(tenancyActions.clusterType, dispatch),
            cluster: bindActionCreators(tenancyActions.cluster, dispatch)
        }
    })
)(TenancyPage);

const NotFound = connect(
    undefined,
    (dispatch) => ({
        notificationActions: bindActionCreators(notificationActions, dispatch)
    })
)((props) => {
    props.notificationActions.warning('The page you requested was not found');
    return <Redirect to="/dashboard" />;
});

const ProtectedRoute = connect(
    (state) => ({ session: state.session })
)(({ component: Component, session, ...rest }) => (
    <Route
        {...rest}
        render={(props) => (session.username ? (
            <Component {...props} />
        ) : (
            (session.initialising || session.authenticating) ? (
                <div />
            ) : (
                <Redirect to="/login" />
            )
        ))}
    />
));

const TenancyOverviewPage = (props) => (
    <ConnectedTenancyPage {...props}><TenancyOverviewPanel /></ConnectedTenancyPage>
);
const TenancyMachinesPage = (props) => (
    <ConnectedTenancyPage {...props}><TenancyMachinesPanel /></ConnectedTenancyPage>
);
const TenancyVolumesPage = (props) => (
    <ConnectedTenancyPage {...props}><TenancyVolumesPanel /></ConnectedTenancyPage>
);
const TenancyClustersPage = (props) => (
    <ConnectedTenancyPage {...props}><TenancyClustersPanel /></ConnectedTenancyPage>
);

export class Application extends React.Component {
    render() {
        return (
            <>
                <ConnectedNav />
                <CookielawBanner />
                <Container>
                    <ConnectedNotifications />
                    <Switch>
                        <Route exact path="/" component={SplashPage} />
                        <Route exact path="/login" component={ConnectedLoginPage} />
                        <ProtectedRoute exact path="/dashboard" component={ConnectedDashboard} />
                        <ProtectedRoute exact path="/tenancies/:id" component={TenancyOverviewPage} />
                        <ProtectedRoute exact path="/tenancies/:id/machines" component={TenancyMachinesPage} />
                        <ProtectedRoute exact path="/tenancies/:id/volumes" component={TenancyVolumesPage} />
                        <ProtectedRoute exact path="/tenancies/:id/clusters" component={TenancyClustersPage} />
                        <Route component={NotFound} />
                    </Switch>
                </Container>
            </>
        );
    }
}
