/**
 * DTO to represent plugin descriptor (teqfw.json) structure
 * that is related to 'http2' node:
 */
// MODULE'S VARS
const NS = 'TeqFw_Http2_Back_Api_Dto_Plugin_Desc';

// MODULE'S CLASSES
class TeqFw_Http2_Back_Api_Dto_Plugin_Desc {
    /** @type {TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler[]} */
    handlers;
    /**
     * Services realm (see DEF.BACK_REALM in plugins)
     * @type {string}
     */
    realm;
    /**
     * List of plugin's services (DI IDs).
     * @type {string[]}
     */
    services;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Http2_Back_Api_Dto_Plugin_Desc
 */
class Factory {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {typeof TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler} */
        const DHandler = spec['TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler#']; // class
        /** @type {TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler.Factory} */
        const fHandler = spec['TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler#Factory$']; // singleton

        /**
         * @param {TeqFw_Http2_Back_Api_Dto_Plugin_Desc|null} data
         * @return {TeqFw_Http2_Back_Api_Dto_Plugin_Desc}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Http2_Back_Api_Dto_Plugin_Desc();
            res.handlers = Array.isArray(data?.handlers)
                ? data.handlers.map((one) => (one instanceof DHandler) ? one : fHandler.create(one))
                : [];
            res.realm = data?.realm;
            res.services = Array.isArray(data?.services) ? data.services : [];
            return res;
        }
    }
}

// freeze class to deny attributes changes then export class
Object.freeze(TeqFw_Http2_Back_Api_Dto_Plugin_Desc);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
export {
    TeqFw_Http2_Back_Api_Dto_Plugin_Desc as default,
    Factory
} ;
