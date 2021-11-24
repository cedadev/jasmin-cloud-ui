/**
 * Module containing the React component responsible for rendering notifications.
 */

import React from 'react';
import { ToastContainer, Toast } from 'react-bootstrap';

const Notification = (props) => (
    <Toast
        bg={props.notification.context}
        onClose={props.remove}
    >
        <Toast.Header><span className="me-auto" /></Toast.Header>
        <Toast.Body className={props.notification.context === 'danger' && 'text-white'}>
            {props.notification.message}
        </Toast.Body>
    </Toast>
);

export const Notifications = (props) => (
    <ToastContainer className="position-absolute m-2 end-0" style={{ zIndex: '1' }}>
        {props.notifications.map((notification, i) => (
            <Notification
                key={i}
                notification={notification}
                remove={() => props.notificationActions.remove(i)}
            />
        ))}
    </ToastContainer>
);
