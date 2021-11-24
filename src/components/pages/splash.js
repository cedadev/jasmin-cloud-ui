/**
 * This module contains the React component for the splash page.
 */

import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export class SplashPage extends React.Component {
    componentDidMount() {
        document.title = 'Home | JASMIN Cloud Portal';
    }

    render() {
        return (
            <Row>
                <Col md={12}>
                    <div className="splash">
                        <div className="splash-header">
                            <h1>JASMIN Cloud Portal</h1>
                        </div>
                        <Row className="justify-content-end border border-primary p-2">
                            <Col lg={7}>
                                <p>Here, you can manage your tenancies in the JASMIN Cloud.</p>
                            </Col>
                            <Col lg={5}>
                                <div className="d-grid gap-2">
                                    <LinkContainer to="/dashboard">
                                        <Button varient="primary" size="lg">
                                            <i className="fas fa-fw fa-cloud" />
                                            {'\u00A0\u00A0'}
                                            My JASMIN Cloud tenancies
                                        </Button>
                                    </LinkContainer>
                                    <Button
                                        varient="primary"
                                        size="lg"
                                        href="https://accounts.jasmin.ac.uk/services/cloud_tenancies/"
                                    >
                                        <i className="fas fa-fw fa-user-plus" />
                                        {'\u00A0\u00A0'}
                                        Join a JASMIN Cloud tenancy
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        );
    }
}
