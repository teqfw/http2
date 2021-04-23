/**
 * Data-object to represent plugin descriptor structure that is related to 'http2' node:
 */
// MODULE'S VARS
const NS = 'TeqFw_Http2_Api_Back_Plugin_Desc';

/**
 * @memberOf TeqFw_Http2_Api_Back_Plugin_Desc
 */
class Handler {
    /**
     * List of handlers (namespaces only) followed by this handler:
     *   - ["Vendor1_Module1_Plugin_Http2_Handler", "Vendor2_Module2_Plugin_Http2_Handler"]
     *   - ThisHandler
     *
     * TODO: this approach is more complex then with 'weight' option but is more flexible.
     *
     * @type {String[]}
     */
    after;
    /**
     * List of handlers (namespaces only) that follow this handler:
     *   - ThisHandler
     *   - ["Vendor1_Module1_Plugin_Http2_Handler", "Vendor2_Module2_Plugin_Http2_Handler"]
     *
     * TODO: this approach is more complex then with 'weight' option but is more flexible.
     *
     * @type {String[]}
     */
    before;
    /**
     * Dependency ID for handler factory to create handler: "Fl32_Ap_User_Plugin_Http2_Handler_Session$".
     *
     *  @type {String}
     */
    depId;
    /**
     * Weight of the handler in the list of all handlers (more weight means closer to the beginning of the list).
     * This is temporary approach for quick organizing of the requests handlers. before/after options are more
     * flexible but is more complex.
     *
     * @type {Number}
     * @deprecated
     */
    weight;
}

class TeqFw_Http2_Api_Back_Plugin_Desc {
    /** @type {Handler[]} */
    handlers;
    /**
     * Services realm (see DEF.BACK_REALM in plugins)
     * @type {String}
     */
    realm;
    /**
     * List of plugin's services (DI IDs).
     * @type {String[]}
     */
    services;
}

Object.freeze(TeqFw_Http2_Api_Back_Plugin_Desc);
Object.defineProperty(Handler, 'name', {value: `${NS}.${Handler.name}`});

export {
    TeqFw_Http2_Api_Back_Plugin_Desc as default,
    Handler
};
