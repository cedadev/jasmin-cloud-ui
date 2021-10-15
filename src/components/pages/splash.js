/**
 * This module contains the React component for the splash page.
 */

import React from 'react';
import { Row, Col, Well, Button } from 'react-bootstrap';
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
                            <h1>Welcome to the JASMIN Cloud Portal</h1>
                        </div>
                        <div className="splash-body clearfix">
                            <Col md={7}>
                                <p>Here, you can manage your tenancies in the JASMIN Cloud.</p>
                            </Col>
                            <Col md={5}>
                                    <LinkContainer to={`/dashboard`}>
                                        <Button bsStyle="primary" bsSize="lg" block>
                                            <i className="fa fa-fw fa-cloud" />
                                            {'\u00A0\u00A0'}
                                            My JASMIN Cloud tenancies
                                        </Button>
                                    </LinkContainer>
                                    <Button
                                      bsStyle="primary"
                                      bsSize="lg"
                                      block
                                      href="https://accounts.jasmin.ac.uk/services/cloud_tenancies/">
                                        <i className="fa fa-fw fa-user-plus" />
                                        {'\u00A0\u00A0'}
                                        Join a JASMIN Cloud tenancy
                                    </Button>
                            </Col>
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}
