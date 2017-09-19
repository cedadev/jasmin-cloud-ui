/**
 * Module containing the React component responsible for rendering notifications.
 */

import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';


const Notification = (props) => (
    <div
      role="notification"
      className={`notification notification-${props.notification.context}`}>
        <button
          type="button"
          aria-label="Close"
          onClick={props.remove}>
            <i className="fa fa-fw fa-times" aria-hidden="true" />
            <span className="sr-only">Close</span>
        </button>
        <div className="notification-content">{props.notification.message}</div>
    </div>
);


export const Notifications = (props) => (
    <div className="notification-container">
        <TransitionGroup>
            {props.notifications.map((notification, i) =>
                <CSSTransition
                  key={i}
                  classNames="notification"
                  timeout={{ enter: 300, exit: 300 }}>
                    <Notification
                      notification={notification}
                      remove={() => props.notificationActions.remove(i)} />
                </CSSTransition>
            )}
        </TransitionGroup>
    </div>
);
