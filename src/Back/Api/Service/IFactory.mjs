/**
 * Interface for factories to create API services for 'TeqFw_Http2_Plugin_Handler_Service'.
 * @namespace TeqFw_Http2_Back_Api_Service_IServiceFactory
 */

/**
 * Service function to handle HTTP API requests.
 *
 * @param {TeqFw_Http2_Plugin_Handler_Service.Context} apiCtx
 * @returns {Promise<TeqFw_Http2_Plugin_Handler_Service.Result>}
 * @interface
 * @memberOf TeqFw_Http2_Back_Api_Service_IServiceFactory
 */
async function iService(apiCtx) {}

/**
 * @interface
 */
class TeqFw_Http2_Back_Api_Service_IServiceFactory {
    /**
     * @returns {string} Dependency ID for DTO with Request, Response structures and with Factory to create new
     * instances of requests and responses.
     */
    getDtoId() {}

    /**
     * @returns {string} route to service relatively to plugin realm.
     */
    getRoute() {}

    /**
     * @returns TeqFw_Http2_Back_Api_Service_IServiceFactory.iService
     */
    getService() {}
}

export {
    TeqFw_Http2_Back_Api_Service_IServiceFactory as default,
    iService
}
