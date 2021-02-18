import $path from 'path';
import {constants as H2} from 'http2';

const PARSE = 'parse';
const SERVICE = 'service';

/**
 * Data structure to group input data for API services.
 */
class TeqFw_Http2_Back_Server_Handler_Api_Context {
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

class TeqFw_Http2_Back_Server_Handler_Api_Result {
    /** @type {Object.<String, String>} */
    headers = {}; // see nodejs 'http2.constants' with 'HTTP2_HEADER_...' prefixes
    /** @type {Object} */
    response;
}

/**
 * Factory to create HTTP2 server handler for API requests.
 *
 * @implements {TeqFw_Http2_Back_Server_Handler_Factory}
 */
class TeqFw_Http2_Back_Server_Handler_Api {

    constructor(spec) {
        /** @type {TeqFw_Core_App_Defaults} */
        const DEF = spec['TeqFw_Core_App_Defaults$'];
        /** @type {TeqFw_Di_Container} */
        const container = spec[DEF.DI_CONTAINER];   // named singleton
        /** @type {TeqFw_Core_App_Logger} */
        const logger = spec['TeqFw_Core_App_Logger$'];  // instance singleton
        /** @type {TeqFw_Core_App_Plugin_Registry} */
        const registry = spec['TeqFw_Core_App_Plugin_Registry$'];   // instance singleton
        /** @type {typeof TeqFw_Http2_Back_Server_Stream_Report} */
        const Report = spec['TeqFw_Http2_Back_Server_Stream#Report'];   // class constructor

        /**
         * Create handler to load user sessions data to request context.
         * @returns {Promise<Fl32_Teq_User_App_Server_Handler_Session.handler>}
         */
        this.createHandler = async function () {
            // PARSE INPUT & DEFINE WORKING VARS
            const regexApi = new RegExp(`^(/${DEF.REALM_API}/)(.*)`);
            let router = {};

            // DEFINE INNER FUNCTIONS

            /**
             * Handler to process API requests.
             *
             * @param {TeqFw_Http2_Back_Server_Stream_Context} context
             * @returns {Promise<TeqFw_Http2_Back_Server_Stream_Report>}
             * @memberOf TeqFw_Http2_Back_Server_Handler_Api
             * @implements {TeqFw_Http2_Back_Server_Stream.handler}
             */
            async function handler(context) {
                // MAIN FUNCTIONALITY
                const result = new Report();
                /** @type {TeqFw_Http2_Back_Server_Handler_Api_Context} */
                const apiCtx = new TeqFw_Http2_Back_Server_Handler_Api_Context();
                apiCtx.sharedContext = context.shared;
                const path = context.headers[H2.HTTP2_HEADER_PATH];
                const parts = regexApi.exec(path);
                if (Array.isArray(parts)) {
                    for (const route in router) {
                        const uri = context.headers[H2.HTTP2_HEADER_PATH];
                        if (route === uri) {
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
                                    result.headers[H2.HTTP2_HEADER_STATUS] = H2.HTTP_STATUS_OK;
                                    result.headers[H2.HTTP2_HEADER_CONTENT_TYPE] = 'application/json';
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
             * @param {String} mainClassName context name for DI container to get plugin initializers.
             * @returns {Promise<void>}
             * @memberOf TeqFw_Http2_Back_Server_Handler_Api.createHandler
             */
            async function initRoutes(mainClassName) {
                logger.debug('Map plugins API services:');
                const items = registry.items();
                for (const item of items) {
                    if (item.initClass) {
                        /** @type {TeqFw_Core_App_Plugin_Init_Base} */
                        const plugin = await container.get(item.initClass, mainClassName);
                        if (plugin && (typeof plugin.getServicesList === 'function')) {
                            const realm = plugin.getServicesRealm();
                            const prefix = $path.join('/', DEF.REALM_API, realm);
                            const map = plugin.getServicesList();
                            for (const one of map) {
                                /** @type {TeqFw_Http2_Back_Server_Handler_Api_Factory} */
                                const factory = await container.get(one, mainClassName);
                                const tail = factory.getRoute();
                                const route = $path.join(prefix, tail);
                                logger.debug(`    ${route} => ${one}`);
                                router[route] = {};
                                if (typeof factory.createInputParser === 'function') {
                                    /** @type {TeqFw_Http2_Back_Server_Handler_Api_Factory.parse} */
                                    router[route][PARSE] = factory.createInputParser();
                                }
                                /** @type {TeqFw_Http2_Back_Server_Handler_Api_Factory.service} */
                                const service = factory.createService();
                                router[route][SERVICE] = service;
                            }
                        }
                    }
                }
            }

            // MAIN FUNCTIONALITY
            await initRoutes(this.constructor.name);
            const name = `${this.constructor.name}.${handler.name}`;
            logger.debug(`HTTP2 requests handler '${name}' is created.`);

            // COMPOSE RESULT
            Object.defineProperty(handler, 'name', {value: `${this.constructor.name}.${handler.name}`});
            return handler;
        };
    }

}

export {
    TeqFw_Http2_Back_Server_Handler_Api as default,
    TeqFw_Http2_Back_Server_Handler_Api_Context as Context,
    TeqFw_Http2_Back_Server_Handler_Api_Result as Result,
};
