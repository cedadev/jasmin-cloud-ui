/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { Redirect } from 'react-router';

import { Loading } from '../../utils';


class QuotaProgressBar extends React.Component {
    render() {
        const quota = this.props.quota;
        const label = `${quota.used}${quota.units || ''} of ${quota.allocated}${quota.units || ''} used`;
        const fraction = quota.used / quota.allocated;
        const context = (fraction <= 0.6 ?
            'success' :
            (fraction <= 0.8 ? 'warning' : 'danger'));
        return (
            <div className="clearfix">
                <ProgressBar bsStyle={context} max={quota.allocated} now={quota.used} />
                <span className="text-muted pull-right">{label}</span>
            </div>
        );
    }
}

export class TenancyOverviewPanel extends React.Component {
    setPageTitle(props) {
        document.title = `Overview | ${props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle(this.props)
    componentWillUpdate = (props) => this.setPageTitle(props)

    render() {
        const { fetching, data: quotas } = this.props.tenancy.quotas;
        return (
            <Row>
                {quotas ? (
                    <Col md={12}>
                        <dl className="quotas">
                            <dt>Machines</dt>
                            <dd><QuotaProgressBar quota={quotas.machines} /></dd>
                            <dt>Volumes</dt>
                            <dd><QuotaProgressBar quota={quotas.volumes} /></dd>
                            <dt>CPUs</dt>
                            <dd><QuotaProgressBar quota={quotas.cpus} /></dd>
                            <dt>RAM</dt>
                            <dd><QuotaProgressBar quota={quotas.ram} /></dd>
                            <dt>Storage</dt>
                            <dd><QuotaProgressBar quota={quotas.storage} /></dd>
                        </dl>
                    </Col>
                ) : (
                    <Col md={6} mdOffset={3}>
                        {fetching ? (
                            <Loading message="Loading quota information..."/>
                        ) : (
                            <div
                              role="notification"
                              className="notification notification-inline notification-danger">
                                <div className="notification-content">Unable to load quota information</div>
                            </div>
                        )}
                    </Col>
                )}
            </Row>
        );
    }
}
