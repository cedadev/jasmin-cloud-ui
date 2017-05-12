/**
 * Module containing utilities for working with forms.
 */

import React from 'react';
import { Redirect } from 'react-router-dom';
import {
    Alert, FormGroup, ControlLabel, HelpBlock, Modal, Form as BSForm
} from 'react-bootstrap';


export class Loading extends React.Component {
    render() {
        return (
            <div className="loading-notice text-muted">
                <i className="fa fa-fw fa-spinner fa-5x fa-pulse" />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }
}

export class AlertWithIcon extends React.Component {
    ICON_CLASSES = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        danger: 'fa-exclamation-circle'
    }

    render() {
        const { bsStyle = 'info' } = this.props;
        return (
            <Alert {...this.props} className="alert-with-icon">
                <i className={`fa ${this.ICON_CLASSES[bsStyle]}`}></i>
                <span>{this.props.children}</span>
            </Alert>
        );
    }
}

export class Form extends React.Component {
    render() {
        const { children, disabled = false, ...props } = this.props;
        return (
            <BSForm {...props}>
                <fieldset disabled={disabled}>
                    {children}
                </fieldset>
            </BSForm>
        );
    }
}

export class Field extends React.Component {
    render() {
        const { name, children, label = null, helpText = null, errors = [] } = this.props;
        return (
            <FormGroup
                controlId={name}
                validationState={errors.length > 0 ? 'error' : null}>
                {label && <ControlLabel>{label}</ControlLabel>}
                <ControlContainer>
                    {children}
                    {helpText && <HelpBlock>{helpText}</HelpBlock>}
                    {errors && errors.map((e) => <HelpBlock>{e}</HelpBlock>)}
                </ControlContainer>
            </FormGroup>
        );
    }
}

export class ControlContainer extends React.Component {
    render() {
        const { children, ...props } = this.props;
        return (
            <div className="control-container" {...props}>
                {children}
            </div>
        );
    }
}
