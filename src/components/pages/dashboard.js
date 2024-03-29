/**
 * This module contains the component for rendering the tenancies dashboard.
 */

import isEmpty from 'lodash/isEmpty';

import React from 'react';
import {
    Row, Col, Alert, ListGroup, Card,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { Loading } from '../utils';

export class Dashboard extends React.Component {
    componentDidMount() {
        document.title = 'Dashboard | JASMIN Cloud Portal';
    }

    render() {
        const { fetching, data: tenancies } = this.props.tenancies;
        if (!isEmpty(tenancies || {})) {
            // Sort the tenancies by name before rendering
            const sorted = Object.values(tenancies)
                .sort((x, y) => (x.name < y.name ? -1 : (x.name > y.name ? 1 : 0)));
            return (
                <>
                    <Row><h1>Dashboard</h1></Row>
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Card>
                                <Card.Header>Available tenancies</Card.Header>
                                <ListGroup fill="true">
                                    {sorted.map((t) => (
                                        <LinkContainer
                                            key={t.id}
                                            to={`/tenancies/${t.id}`}
                                        >
                                            <ListGroup.Item
                                                action
                                            >
                                                {t.name}
                                            </ListGroup.Item>
                                        </LinkContainer>
                                    ))}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </>
            );
        }
        if (fetching) {
            return <Loading message="Loading tenancies..." />;
        }

        return (
            <div>
                <h1>Dashboard</h1>
                <Row>
                    <Col md={6} mdOffset={3}>
                        <Alert>
                            <Alert.Heading>Available tenancies</Alert.Heading>
                            You do not belong to any tenancies.
                        </Alert>
                    </Col>
                </Row>
            </div>
        );
    }
}
