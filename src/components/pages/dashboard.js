/**
 * This module contains the component for rendering the tenancies dashboard.
 */

import React from 'react';
import { PageHeader, Row, Col, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { Loading } from '../utils';


export class Dashboard extends React.Component {
    componentDidMount() {
        document.title = 'Dashboard | JASMIN Cloud Portal';
    }

    render() {
        const { fetching, data: tenancies } = this.props.tenancies;
        if( tenancies === null ) return <Loading />;
        return (
            <div>
                <PageHeader>Dashboard</PageHeader>
                <Row>
                    <Col md={6} mdOffset={3}>
                        <Panel header="Available tenancies">
                            <ListGroup fill>
                                {Object.values(tenancies).map((t) =>
                                    <LinkContainer
                                      key={t.id}
                                      to={`/tenancies/${t.id}`}>
                                        <ListGroupItem>{t.name}</ListGroupItem>
                                    </LinkContainer>
                                )}
                            </ListGroup>
                        </Panel>
                    </Col>
                </Row>
            </div>
        );
    }
}
