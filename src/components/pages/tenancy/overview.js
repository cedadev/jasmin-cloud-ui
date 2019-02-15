/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { Row, Col, Panel, Button } from 'react-bootstrap';

import { Loading } from '../../utils';


class QuotaProgressCircle extends React.Component {
    // Initial animation code lifted from https://github.com/iqnivek/react-circular-progressbar
    constructor(props) {
        super(props);
        this.state = { fraction: 0 };
    }

    componentDidMount = () => {
        this.initialTimeout = setTimeout(() => {
            this.requestAnimationFrame = window.requestAnimationFrame(() => {
                this.setState({
                    fraction: this.props.quota.used / this.props.quota.allocated
                });
            });
        }, 0);
    }

    componentDidUpdate = (prevProps) => {
        const prevFraction = prevProps.quota.used / prevProps.quota.allocated;
        const fraction = this.props.quota.used / this.props.quota.allocated;
        if( prevFraction !== fraction ) this.setState({ fraction });
    }

    componentWillUnmount = () => {
        clearTimeout(this.initialTimeout);
        window.cancelAnimationFrame(this.requestAnimationFrame);
    }

    render() {
        const { title, quota, strokeWidth = 20 } = this.props;
        const label = `
            ${quota.used}${quota.units || ''} of
            ${quota.allocated}${quota.units || ''} used
        `;
        // We don't use this.state.fraction because we want this to be fixed
        // This only makes a different during the initial animation
        const percent = Math.round((quota.used / quota.allocated) * 100);
        const context = (percent <= 60 ? 'success' : (percent <= 80 ? 'warning' : 'danger'));
        const radius = 50 - (strokeWidth / 2);
        const circumference = Math.PI * 2 * radius;
        const pathDescription = `
            M 50,50 m 0,-${radius}
            a ${radius},${radius} 0 1 1 0,${2 * radius}
            a ${radius},${radius} 0 1 1 0,-${2 * radius}
        `;
        return (
            <div className="quota-progress">
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">{title}</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <svg viewBox="0 0 100 100">
                            <path
                            className="quota-progress-background"
                            strokeWidth={strokeWidth}
                            d={pathDescription}
                            fillOpacity={0} />
                            <path
                            className={`quota-progress-bar ${context}`}
                            strokeWidth={strokeWidth}
                            d={pathDescription}
                            fillOpacity={0}
                            strokeDasharray={circumference}
                            strokeDashoffset={(1 - this.state.fraction) * circumference} />
                            <text className="quota-progress-text" x={50} y={50}>
                                {percent}%
                            </text>
                        </svg>
                    </Panel.Body>
                    <Panel.Footer>{label}</Panel.Footer>
                </Panel>
            </div>
        );
    }
}

export class TenancyOverviewPanel extends React.Component {
    setPageTitle(props) {
        document.title = `Overview | ${props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle(this.props)
    componentDidUpdate = (props) => this.setPageTitle(props)

    render() {
        const { fetching, data: quotas } = this.props.tenancy.quotas;
        return (
            quotas ? (
                <div className="quotas-wrapper">
                    <Row>
                        <Col md={12}>
                            <div className="pull-right">
                                <Button
                                  bsStyle="info"
                                  disabled={fetching}
                                  onClick={() => this.props.tenancyActions.quota.fetchList()}
                                  title="Refresh quotas">
                                    <i className={`fa fa-refresh ${fetching ? 'fa-spin' : ''}`}></i>
                                    {'\u00A0'}
                                    Refresh
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <QuotaProgressCircle title="Machines" quota={quotas.machines} />
                            <QuotaProgressCircle title="Volumes" quota={quotas.volumes} />
                            <QuotaProgressCircle title="External IPs" quota={quotas.external_ips} />
                            <QuotaProgressCircle title="CPUs" quota={quotas.cpus} />
                            <QuotaProgressCircle title="RAM" quota={quotas.ram} />
                            <QuotaProgressCircle title="Storage" quota={quotas.storage} />
                        </Col>
                    </Row>
                </div>
            ) : (
                <Row>
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
                </Row>
            )
        );
    }
}
