###
This is the entrypoint for the JASMIN Cloud Portal UI
###

m = require "mithril"
Navigation = require "./components/Navigation"

m.mount document.getElementById("navigation"), Navigation
