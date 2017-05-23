/**
 * This module contains the tenancy quotas modal.
 */

import React from 'react';
import { Button, Modal, ProgressBar } from 'react-bootstrap';

import { Loading } from '../../utils';


class QuotaProgressBar extends React.Component {
    render() {
        const quota = this.props.quota;
        const label = quota.units ?
            `${quota.used}${quota.units} of ${quota.allocated}${quota.units} used` :
            `${quota.used} of ${quota.allocated} used`;
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

export class QuotasModalButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: false };
    }

    open = () => this.setState({ visible: true });
    close = () => this.setState({ visible: false });

    render() {
        const { fetching, data: quotas } = this.props.quotas;
        return (
            <Button
              bsStyle="warning"
              onClick={this.open}>
                <i className="fa fa-pie-chart"></i>
                {' '}
                Quotas

                <Modal show={this.state.visible} className="quotas-modal">
                    <Modal.Header>
                        <Modal.Title>Tenancy Quotas</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {fetching ? (
                            <Loading />
                        ) : (
                            <dl className="quotas">
                                <dt>CPUs</dt>
                                <dd><QuotaProgressBar quota={quotas.cpus} /></dd>
                                <dt>RAM</dt>
                                <dd><QuotaProgressBar quota={quotas.ram} /></dd>
                                <dt>Storage</dt>
                                <dd><QuotaProgressBar quota={quotas.storage} /></dd>
                                <dt>External IPs</dt>
                                <dd><QuotaProgressBar quota={quotas.external_ips} /></dd>
                            </dl>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                          bsStyle="info"
                          disabled={fetching}
                          onClick={this.props.fetchQuotas}>
                            <i className="fa fa-refresh" />
                            {' '}
                            Refresh
                        </Button>
                        <Button bsStyle="primary" onClick={this.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Button>
        );
    }
}
