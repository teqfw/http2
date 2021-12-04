/**
 * HTTP/2 server with TLS to process web requests.
 *
 * @namespace TeqFw_Http2_Back_SecureServer
 */
// MODULE'S IMPORT
import http2 from 'http2';
import {readFileSync} from 'fs';
import {isAbsolute, join} from 'path';

// MODULE'S CLASSES
export default class TeqFw_Http2_Back_SecureServer {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Http2_Back_Defaults} */
        const DEF = spec['TeqFw_Http2_Back_Defaults$'];
        /** @type {TeqFw_Core_Back_Config} */
        const config = spec['TeqFw_Core_Back_Config$'];
        /** @type {Function|TeqFw_Http2_Back_Server_Stream.action} */
        const process = spec['TeqFw_Http2_Back_Server_Stream$'];
        /** @type {TeqFw_Web_Back_Handler_Registry} */
        const registryHndl = spec['TeqFw_Web_Back_Handler_Registry$'];

        // PARSE INPUT & DEFINE WORKING VARS
        /** @type {module:http2.Http2Server} */
        let _server;

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

            /**
             * Load key/cert from PEM file.
             * @param {string} path absolute or relative (to root folder) path to PEM file
             * @param {string} root absolute path to root folder of the app
             * @return {Buffer}
             */
            function loadPemFile(path, root) {
                const fullPath = isAbsolute(path) ? path : join(root, path);
                return readFileSync(fullPath);
            }

            // MAIN FUNCTIONALITY
            const boot = config.getBoot();
            /** @type {TeqFw_Web_Back_Dto_Config_Local} */
            const cfg = config.getLocal(DEF.MOD_WEB.SHARED.NAME);
            const key = loadPemFile(cfg?.server?.secure?.key, boot.projectRoot);
            const cert = loadPemFile(cfg?.server?.secure?.cert, boot.projectRoot);
            _server = http2.createSecureServer({key, cert});
            // create all handlers (static, api, etc.)
            await registryHndl.init();
            // set event handlers for the server
            _server.on('error', handlerError);
            _server.on('stream', process);
        };

        /**
         * Run HTTP/2 server.
         *
         * @param {number} port
         */
        this.listen = function (port) {
            _server.listen(port);
        };
    }
}
