/**
 * This module contains the React component for the splash page.
 */

import React from 'react';


export class SplashPage extends React.Component {
    componentDidMount() {
        document.title = 'Home | JASMIN Cloud Portal';
    }

    render() {
        return (
            <h1 className="page-header">This is the splash page</h1>
        );
    }
}
