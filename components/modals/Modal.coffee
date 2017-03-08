###
This module provides a reusable modal component.
###

m = require 'mithril'
u = require '../Utils'


Manager = do ->
    modalContainer = document.createElement('div')
    document.body.appendChild(modalContainer)
    return {
        open: (modal) ->
            # Wrap the modal component in something that manages the lifecycle
            m.mount(modalContainer,
                oncreate: (vnode) ->
                    $dom = $(vnode.dom)
                    # Turn the created DOM element into a Bootstrap modal
                    $dom.modal(backdrop: 'static', keyboard: false)
                    # Dismissing the modal should trigger Manager.close
                    $dom.on('hidden.bs.modal', Manager.close)

                onbeforeremove: (vnode) ->
                    # Make sure that if the modal is closed using Manager.close, it fades out nicely
                    promise = new Promise(
                        (resolve) -> $(vnode.dom).on('hidden.bs.modal', resolve)
                    )
                    $(vnode.dom).modal('hide')
                    promise

                view: (vnode) -> m(modal)
            )

        close: -> m.mount(modalContainer, null)
    }


Base =
    view: (vnode) ->
        dismissable = vnode.attrs.dismissable ? true
        m(".modal.fade[role='dialog'][tabindex='-1']",
            m(".modal-dialog",
                m(".modal-content",
                    m(".modal-header",
                        if dismissable
                            m("button.close[type='button']\
                                           [data-dismiss='modal']\
                                           [aria-label='Close']",
                                m("span[aria-hidden='true']", m.trust("&times;"))
                            )
                        else
                            null
                        m("h4.modal-title", vnode.attrs.title)
                    ),
                    vnode.children
                )
            )
        )


module.exports = { Base, open: Manager.open, close: Manager.close }
