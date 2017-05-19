/**
 * This module contains the component for rendering the tenancies dashboard.
 */

import React from 'react';
import { PageHeader, Row, Col, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { Loading } from '../utils';


class TenancyItem extends React.Component {
    render() {
        const tenancy = this.props.tenancy;
        return (
            <LinkContainer to={`/tenancies/${tenancy.id}`}>
                <ListGroupItem>{tenancy.name}</ListGroupItem>
            </LinkContainer>
        );
    }
}

export class Dashboard extends React.Component {
    componentDidMount() {
        document.title = 'Dashboard | JASMIN Cloud Portal';
    }

    render() {
        const { fetching, data: tenancies } = this.props.tenancies;
        if( fetching ) return <Loading />;
        return (
            <div>
                <PageHeader>Dashboard</PageHeader>
                <Row>
                    <Col md={6} mdOffset={3}>
                        <Panel header="Available tenancies">
                            <ListGroup fill>
                                {Object.values(tenancies).map((t) =>
                                    <TenancyItem key={t.id} tenancy={t} />
                                )}
                            </ListGroup>
                        </Panel>
                    </Col>
                </Row>
            </div>
        );
    }
}
