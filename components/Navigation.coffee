"""
This module provides the navigation component
"""

m = require 'mithril'
u = require './Utils'
User = require '../models/User'
LoginModal = require './modals/LoginModal'

module.exports =
    view: ->
        m "ul.nav.navbar-nav.navbar-right",
            if User.current?
                m("li.dropdown",
                    m("a.dropdown-toggle[aria-expanded='false']\
                                        [aria-haspopup='true']\
                                        [data-toggle='dropdown']\
                                        [href='#']\
                                        [role='button']",
                        m("i.fa.fa-user"),
                        m.trust("&nbsp; "),
                        User.current,
                        " ",
                        m("span.caret")
                    ),
                    m("ul.dropdown-menu",
                        m("li", m("a[href='#']",
                            m("i.fa.fa-sign-out.fa-fw"),
                            "Sign out"
                        ))
                    )
                )
            else
                m("li",
                    m("a[href='#']",
                        { onclick: u.preventDefault(LoginModal.open) },
                        "Sign in"
                    )
                )
