/**
 * This module contains the component for showing/hiding the cookielaw banner.
 */

import React from 'react';
import { Container, Alert, ButtonGroup, Button } from 'react-bootstrap';

import Cookies from 'js-cookie';


export class CookielawBanner extends React.Component {
    constructor(props) {
        super(props)
        this.state = { visible: !Cookies.get('cookielaw_accepted') };
    }

    cookielawAccepted = () => {
        // Create a cookie that effectively never expires
        Cookies.set('cookielaw_accepted', '1', { expires: 36500 })
        this.setState({ visible: false })
    }

    render() {
        if( this.state.visible ) {
            return (
                <Container>
                    <Alert bsStyle="info" className="text-center">
                        <span style={{ marginRight: '5px'}}>
                            This website and other JASMIN sites use cookies.
                            By continuing to use this website you are agreeing to our use of cookies.
                        </span>
                        <ButtonGroup>
                            <Button onClick={this.cookielawAccepted}>OK</Button>
                            <Button target="_blank"
                                    href="https://accounts.jasmin.ac.uk/account/privacy/">
                                Find out more
                            </Button>
                        </ButtonGroup>
                    </Alert>
                </Container>
            );
        }
        return null;
    }
}
