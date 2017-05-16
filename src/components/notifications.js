/**
 * Module containing the React component responsible for rendering notifications.
 */

import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


class Notification extends React.Component {
    render() {
        const { notification, removeNotification } = this.props;
        return (
            <div
              role="notification"
              className={`notification notification-${notification.context}`}>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={removeNotification}>
                    <i className="fa fa-fw fa-times" aria-hidden="true" />
                    <span className="sr-only">Close</span>
                </button>
                <div className="notification-content">{notification.message}</div>
            </div>
        );
    }
}


export class Notifications extends React.Component {
    render() {
        const { notifications, removeNotification } = this.props;
        return (
            <div className="notification-container">
                <CSSTransitionGroup
                  transitionName="notification"
                  transitionEnterTimeout={300}
                  transitionLeaveTimeout={300}>
                    {notifications.map((notification, i) =>
                        <Notification
                            key={i}
                            notification={notification}
                            removeNotification={() => removeNotification(i)} />
                    )}
                </CSSTransitionGroup>
            </div>
        );
    }
}
