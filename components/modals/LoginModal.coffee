###
Module providing a dialog for signing in
###

m = require 'mithril'
Modal = require './Modal'
Form = require '../forms/Form'
Controls = require '../forms/Controls'
User = require '../../models/User'


LoginModal =
    view: ->
        m(Form.ModalForm,
            {
                title: 'Sign in with your JASMIN account',
                submitText: 'Sign in',
                onsubmit: (data) ->
                    { username, password } = data
                    User.attemptLogin(username, password)
            },
            m(Form.Field, { name: 'username', label: 'Username' },
                m(Controls.Input,
                    { type: 'text', required: 'required', placeholder: 'Username' }
                )
            ),
            m(Form.Field, { name: 'password', label: 'Password' },
                m(Controls.Input,
                    { type: 'password', required: 'required', placeholder: 'Password' }
                )
            )
        )


module.exports =
    open: -> Modal.open(LoginModal)
    close: -> Modal.close()
