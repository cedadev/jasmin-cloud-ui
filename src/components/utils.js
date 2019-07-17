/**
 * Module containing utilities for working with forms.
 */

import React from 'react';
import {
    FormGroup, ControlLabel, HelpBlock, Form as BSForm
} from 'react-bootstrap';

import $ from 'jquery';
import 'bootstrap-select';


/**
 * This function takes an "actions" object, which is a map of name => function,
 * and returns a new object with the same names where each function has the given
 * args bound.
 *
 * @param {Object.<*, Function>} actions - The "actions" to bind the args to.
 * @param {...*} args - The args to bind.
 * @return {Object.<*, Function>} The bound "actions".
 */
export function bindArgsToActions(actions, ...args) {
    return Object.assign(
        {},
        ...Object.entries(actions)
            .map(([key, func]) => ({
                [key]: (...moreArgs) => func(...args, ...moreArgs)
            }))
    );
}

/**
 * React component for a loading message with a spinner.
 *
 * @param {Object} props - The component properties.
 * @param {string} props.message - The message to display.
 * @return {ReactElement} The React element to render.
 */
export function Loading(props) {
    return (
        <div className="loading-notice text-muted">
            <i className="fa fa-fw fa-spinner fa-pulse" />
            {'\u00A0'}
            {props.message}
        </div>
    );
}


/**
 * React component for a form that can be disabled.
 *
 * In addition to the explicitly documented properties, any properties that are
 * valid for a ``react-bootstrap`` ``Form`` can be given.
 *
 * @param {Object} props - The component properties.
 * @param {string} [props.disabled=false] - Indicates if the form should be disabled.
 * @return {ReactElement} The React element to render.
 */
export function Form(props) {
    const { children, disabled = false, ...rest } = props;
    return (
        <BSForm {...rest}>
            <fieldset disabled={disabled}>
                {children}
            </fieldset>
        </BSForm>
    );
}


/**
 * React component for a Bootstrap formatted form field. The actual form elements
 * should be 'react-bootstrap' form elements, given as children.
 *
 * @param {Object} props - The component properties.
 * @param {string} props.name - The field name.
 * @param {string} [props.label] - The label text.
 * @param {string} [props.helpText] - The help text.
 * @param {string[]} [props.errors] - The errors associated with the field.
 * @return {ReactElement} The react element to render.
 */
export function Field(props) {
    const {
        name,
        children,
        label = null,
        required,
        helpText = null,
        errors = []
    } = props;
    return (
        <FormGroup
          controlId={name}
          className={required && 'required'}
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


/**
 * React component for a control container.
 *
 * @param {Object} props - The component properties.
 * @return {ReactElement} The react element to render.
 */
export function ControlContainer(props) {
    const { children, ...rest } = props;
    return (
        <div className="control-container" {...rest}>
            {children}
        </div>
    );
}


/**
 * React component for a rich select
 *
 * Utilises bootstrap-select under the hood (https://developer.snapappointments.com/bootstrap-select/)
 */
export class RichSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = { open: false };
        this.selectInput = React.createRef();
    }

    componentDidMount() {
        var select = $(this.selectInput.current);
        select.selectpicker();

        // Attach event handlers
        const button = select.siblings('button');
        $('html').click(() => this.setState({ open: false }));
        // If another bootstrap-select receives focus, close
        $('body').on('focus', '.bootstrap-select .btn', (e) => {
            if( $(e.target).is(button) ) return;
            this.setState({ open: false });
        });
        button.click((e) => {
            e.stopPropagation();
            this.setState({ open: !this.state.open && !this.props.disabled });
        });
        select.siblings('.dropdown-menu').find('li a').click(() => {
            if (this.props.multiple) return;
            this.setState({ open: false });
        });
    }

    componentDidUpdate() {
        var select = $(this.selectInput.current)
        select.selectpicker('refresh');
        select.parent().toggleClass('open', this.state.open);
    }

    componentWillUnmount() {
        const select = $(this.selectInput.current);
        // Detach the event handlers
        $('html').off('click');
        $('body').off('focus', '.bootstrap-select .btn');
        select.siblings('button').off('click');
        select.siblings('.dropdown-menu').find('li a').off('click');
    }

    render() {
        return (
            <select ref={this.selectInput} {...this.props}>{this.props.children}</select>
        );
    }
}
