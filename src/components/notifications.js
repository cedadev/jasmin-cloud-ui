/**
 * Module containing the React component responsible for rendering notifications.
 */

import React from 'react';
import { Alert } from 'react-bootstrap';


class Notification extends React.Component {
    render() {
        const { notification, removeNotification } = this.props;
        return (
            <Alert bsStyle={notification.context} onDismiss={removeNotification}>
                {notification.message}
            </Alert>
        );
        /*return (
            <div
                role="notification"
                className={`notification notification-${notification.context}`}>
                <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={() => removeNotification(index)}>
                    <span aria-hidden="true">&times;</span>
                </button>
                {notification.message}
            </div>
        );*/
    }
}


export class Notifications extends React.Component {
    render() {
        const { notifications, removeNotification } = this.props;
        return (
            <div className="notification-container">
                {notifications.map((notification, i) =>
                    <Notification
                        key={i}
                        notification={notification}
                        removeNotification={() => removeNotification(i)} />
                )}
            </div>
        );
    }
}
