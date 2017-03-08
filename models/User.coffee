###
This module defines the User model
###

m = require 'mithril'

OPENSTACK_LOGIN_URL = "http://x86.trystack.org:5000/v3/"

module.exports = window.User = User =
    current: null,

    attemptLogin: (username, password) ->
        m.request({
            method: "POST",
            url: OPENSTACK_LOGIN_URL,
            data:
                auth:
                    passwordCredentials:
                        username: username,
                        password: password
        }).then((data) ->
            console.log(data);
            User.current = username;
        )
