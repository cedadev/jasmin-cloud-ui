/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';
import { Card, Col } from 'react-bootstrap';

import { ResourcePanel } from './resource-utils';

class QuotaProgressCircle extends React.Component {
    // Initial animation code lifted from https://github.com/iqnivek/react-circular-progressbar
    constructor(props) {
        super(props);
        this.state = { fraction: 0 };
    }

    setFraction = () => this.setState({
        fraction: (
            this.props.quota.allocated > 0
                ? this.props.quota.used / this.props.quota.allocated
                : 0
        )
    })

    componentDidMount = () => {
        this.initialTimeout = setTimeout(() => {
            this.requestAnimationFrame = window.requestAnimationFrame(this.setFraction);
        }, 0);
    }

    componentDidUpdate = (prevProps) => {
        const usageChanged = prevProps.quota.used !== this.props.quota.used;
        const allocationChanged = prevProps.quota.allocated !== this.props.quota.allocated;
        if (usageChanged || allocationChanged) this.setFraction();
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
        const percent = Math.round(this.state.fraction * 100);
        const context = (percent <= 60 ? 'success' : (percent <= 80 ? 'warning' : 'danger'));
        const radius = 50 - (strokeWidth / 2);
        const circumference = Math.PI * 2 * radius;
        const pathDescription = `
            M 50,50 m 0,-${radius}
            a ${radius},${radius} 0 1 1 0,${2 * radius}
            a ${radius},${radius} 0 1 1 0,-${2 * radius}
        `;
        return (
            <Col xs>
                <Card>
                    <Card.Header>{title}</Card.Header>
                    <Card.Body className="col-md">
                        <svg viewBox="0 0 100 100">
                            <path
                                className="stroke-light"
                                strokeWidth={strokeWidth}
                                d={pathDescription}
                                fillOpacity={0}
                            />
                            <path
                                className={`stroke-${context}`}
                                strokeWidth={strokeWidth}
                                d={pathDescription}
                                fillOpacity={0}
                                strokeDasharray={circumference}
                                strokeDashoffset={(1 - this.state.fraction) * circumference}
                            />
                            <text className="fs-4 text-secondary svg-text-center" x={50} y={50}>
                                {percent}
                                %
                            </text>
                        </svg>
                    </Card.Body>
                    <Card.Footer>
                        {label}
                    </Card.Footer>
                </Card>
            </Col>
        );
    }
}

const Quotas = (props) => (
    <>
        <QuotaProgressCircle title="Machines" quota={props.resourceData.machines} />
        <QuotaProgressCircle title="Volumes" quota={props.resourceData.volumes} />
        <QuotaProgressCircle title="External IPs" quota={props.resourceData.external_ips} />
        <QuotaProgressCircle title="CPUs" quota={props.resourceData.cpus} />
        <QuotaProgressCircle title="RAM" quota={props.resourceData.ram} />
        <QuotaProgressCircle title="Storage" quota={props.resourceData.storage} />
    </>
);

export class TenancyOverviewPanel extends React.Component {
    setPageTitle = () => {
        document.title = `Overview | ${this.props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle()

    componentDidUpdate = () => this.setPageTitle()

    render() {
        return (
            <ResourcePanel
                resource={this.props.tenancy.quotas}
                resourceActions={this.props.tenancyActions.quota}
                resourceName="quota information"
                className="quotas-wrapper"
            >
                <Quotas />
            </ResourcePanel>
        );
    }
}
