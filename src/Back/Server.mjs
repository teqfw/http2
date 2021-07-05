/**
 * HTTP/2 server to process web requests.
 *
 * @namespace TeqFw_Http2_Back_Server
 */
// MODULE'S IMPORT
import http2 from 'http2';

// MODULE'S CLASSES
export default class TeqFw_Http2_Back_Server {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {Function|TeqFw_Http2_Back_Server_Stream.action} */
        const process = spec['TeqFw_Http2_Back_Server_Stream$'];
        /** @type {TeqFw_Web_Back_Handler_Registry} */
        const registryHndl = spec['TeqFw_Web_Back_Handler_Registry$'];

        // PARSE INPUT & DEFINE WORKING VARS
        /** @type {Http2Server} */
        const server = http2.createServer();

        // DEFINE THIS INSTANCE METHODS
        this.init = async function () {
            // DEFINE INNER FUNCTIONS
            /**
             * Unhandled server error ('server is down').
             *
             * @param err
             */
            function handlerError(err) {
                console.log('Server error: ' + err);
                // debugger;
            }

            // MAIN FUNCTIONALITY
            await registryHndl.init(); // create all handlers (static, api, etc.)
            server.on('error', handlerError);
            server.on('stream', process);
        };

        /**
         * Run HTTP/2 server.
         *
         * @param {number} port
         */
        this.listen = function (port) {
            server.listen(port);
        };
    }
}
