/**
 * Factory to create handler for API services (updated format).
 *
 * @namespace TeqFw_Http2_Plugin_Handler_ServiceNew
 */
// MODULE'S IMPORT
import $path from 'path';
import {constants as H2} from 'http2';

// MODULE'S VARS
const NS = 'TeqFw_Http2_Plugin_Handler_ServiceNew';
const PARSE = 'parse';
const SERVICE = 'service';

// MODULE'S CLASSES
/**
 * Data structure to group input data for API services.
 * @memberOf TeqFw_Http2_Plugin_Handler_ServiceNew
 */
class Context {
    /**
     * Structured body data.
     * @type {Object}
     */
    request;
    /**
     * Data being shared between handlers.
     * @type {TeqFw_Http2_Back_Server_Stream_Shared}
     */
    sharedContext;
}

Object.defineProperty(Context, 'name', {value: `${NS}.${Context.name}`});

/**
 * Data structure to group result data for API services.
 * @memberOf TeqFw_Http2_Plugin_Handler_ServiceNew
 */
class Result {
    /** @type {Object.<String, String>} */
    headers = {}; // see nodejs 'http2.constants' with 'HTTP2_HEADER_...' prefixes
    /** @type {Object} */
    response;
}

Object.defineProperty(Result, 'name', {value: `${NS}.${Result.name}`});

// MODULE'S FUNCTIONS
/**
 * Factory to create HTTP2 server handler for API services requests.
 *
 * @param {TeqFw_Di_SpecProxy} spec
 * @return {Promise<function(TeqFw_Http2_Back_Server_Stream_Context): TeqFw_Http2_Back_Server_Stream_Report>}
 * @constructor
 * @memberOf TeqFw_Http2_Plugin_Handler_Static
 */
async function Factory(spec) {
    // EXTRACT DEPS
    /** @type {TeqFw_Http2_Defaults} */
    const DEF = spec['TeqFw_Http2_Defaults$'];
    /** @type {TeqFw_Di_Container} */
    const container = spec[DEF.MOD_CORE.DI_CONTAINER];   // singleton
    /** @type {TeqFw_Core_App_Logger} */
    const logger = spec['TeqFw_Core_App_Logger$'];  // singleton
    /** @type {TeqFw_Core_App_Plugin_Registry} */
    const regPlugin = spec['TeqFw_Core_App_Plugin_Registry$'];   // singleton
    /** @type {TeqFw_Http2_Back_Model_Realm_Registry} */
    const regRealms = spec['TeqFw_Http2_Back_Model_Realm_Registry$']; // singleton
    /** @type {typeof TeqFw_Http2_Back_Server_Stream_Report} */
    const Report = spec['TeqFw_Http2_Back_Server_Stream#Report'];   // class

    // PARSE INPUT & DEFINE WORKING VARS
    const regexApi = new RegExp(`^(.*)(/${DEF.ZONE_API}/)(.*)`);
    let router = {};

    // DEFINE INNER FUNCTIONS

    /**
     * Handler to process API requests.
     *
     * @param {TeqFw_Http2_Back_Server_Stream_Context} context
     * @returns {Promise<TeqFw_Http2_Back_Server_Stream_Report>}
     * @memberOf TeqFw_Http2_Plugin_Handler_ServiceNew
     */
    async function handleHttp2Request(context) {
        // MAIN FUNCTIONALITY
        const result = new Report();
        /** @type {TeqFw_Http2_Plugin_Handler_ServiceNew.Context} */
        const apiCtx = new Context();
        apiCtx.sharedContext = context.shared;
        apiCtx.sharedContext[DEF.HTTP_SHARE_HEADERS] = context.headers;
        const path = context.headers[H2.HTTP2_HEADER_PATH];
        const parts = regexApi.exec(path);
        if (Array.isArray(parts)) {
            for (const route in router) {
                const addr = regRealms.parseAddress(path);
                if (addr.route?.includes(route)) {
                    const parser = router[route][PARSE];
                    const service = router[route][SERVICE];
                    // try to parse request data
                    try {
                        if (typeof parser === 'function') {
                            // TODO: add HTTP 400 Bad request state processing
                            apiCtx.request = parser(context);
                        }
                    } catch (e) {
                        const stack = (e.stack) ?? '';
                        const message = e.message ?? 'Unknown error';
                        const error = {message, stack};
                        const out = JSON.stringify({error});
                        console.error(out);
                        result.complete = true;
                        result.headers[H2.HTTP2_HEADER_STATUS] = H2.HTTP_STATUS_BAD_REQUEST;
                        result.headers[H2.HTTP2_HEADER_CONTENT_TYPE] = 'application/json';
                        result.output = out;
                    }
                    if (!result.complete) {
                        const {response, headers: moreHeaders} = await service(apiCtx);
                        if (moreHeaders) {
                            Object.assign(result.headers, moreHeaders);
                        }
                        if (response) {
                            result.complete = true;
                            result.headers[H2.HTTP2_HEADER_STATUS] =
                                result.headers[H2.HTTP2_HEADER_STATUS] || H2.HTTP_STATUS_OK;
                            result.headers[H2.HTTP2_HEADER_CONTENT_TYPE] =
                                result.headers[H2.HTTP2_HEADER_CONTENT_TYPE] || 'application/json';
                            result.output = JSON.stringify({data: response});
                        }
                    }
                    break;  // exit from router loop
                }
            }
        }
        return result;
    }

    /**
     * Compose static routes map for plugins.
     *
     * @param {TeqFw_Di_Container} container
     * @param {String} mainClassName context name for DI container to get plugin initializers.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Http2_Plugin_Handler_ServiceNew.createHandler
     */
    async function initRoutes(container, mainClassName) {
        // DEFINE INNER FUNCTIONS
        /**
         * Extract service related data from plugin init function (old style).
         *
         * @param {TeqFw_Core_App_Plugin_Scan_Item} plugin
         * @param {TeqFw_Di_Container} container
         * @param {String} mainClassName
         * @return {Promise<{realm: String, services: String[]}>}
         */
        async function processPluginInitFunc(plugin, container, mainClassName) {
            let realm, services = [];
            if (plugin.initClass) {
                /** @type {TeqFw_Core_App_Plugin_Init_Base} */
                const initObj = await container.get(plugin.initClass, mainClassName);
                if (initObj && (typeof initObj.getServicesList === 'function')) {
                    realm = initObj.getServicesRealm();
                    services = initObj.getServicesList();
                }
            }
            return {realm, services};
        }

        // MAIN FUNCTIONALITY
        logger.debug('Map plugins API services:');
        const items = regPlugin.items();
        for (const item of items) {
            const services = [];
            // get services data from plugin init object
            const {
                realm: realmInit,
                services: servicesInit
            } = await processPluginInitFunc(item, container, mainClassName);
            const realmDesc = item.teqfw?.http2?.realm;
            const servicesDesc = item.teqfw?.http2?.services;
            // concatenate data from init func and from teqfw descriptor
            const realm = realmDesc ?? realmInit;
            services.push(...servicesInit);
            if (Array.isArray(servicesDesc)) services.push(...servicesDesc);
            if (realm && services.length) {
                const prefix = $path.join('/', realm);
                for (const one of services) {
                    /** @type {TeqFw_Http2_Api_Back_Service_Factory} */
                    const factory = await container.get(one, mainClassName);
                    const tail = factory.getRoute();
                    const route = $path.join(prefix, tail);
                    logger.debug(`    ${route} => ${one}`);
                    router[route] = {};
                    if (typeof factory.createInputParser === 'function') {
                        /** @type {TeqFw_Http2_Api_Back_Service_Factory.parse} */
                        router[route][PARSE] = factory.createInputParser();
                    }
                    /** @type {TeqFw_Http2_Api_Back_Service_Factory.service} */
                    router[route][SERVICE] = factory.createService();
                }
            }
        }
    }

    // MAIN FUNCTIONALITY
    await initRoutes(container, NS);
    const name = `${NS}.${handleHttp2Request.name}`;
    logger.debug(`HTTP2 requests handler '${name}' is created.`);

    // COMPOSE RESULT
    Object.defineProperty(handleHttp2Request, 'name', {value: `${NS}.${handleHttp2Request.name}`});
    return handleHttp2Request;
}

// MODULE'S EXPORT
export {
    Factory as default,
    Context,
    Result,
};
