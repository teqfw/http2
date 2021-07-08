/**
 * Stream processor for HTTP/2 server.
 *
 * @namespace TeqFw_Http2_Back_Server_Stream
 */
// MODULE'S IMPORT
import {constants as H2} from 'http2';

// MODULE'S VARS
const NS = 'TeqFw_Http2_Back_Server_Stream';

// MODULE'S FUNCTIONS
/**
 * Factory to setup execution context and to create the stream handler.
 *
 * @param {TeqFw_Di_Shared_SpecProxy} spec
 * @memberOf TeqFw_Http2_Back_Server_Stream
 */
function Factory(spec) {
    // EXTRACT DEPS
    /** @type {TeqFw_Core_Logger} */
    const logger = spec['TeqFw_Core_Logger$'];
    /** @type {Function|TeqFw_Http2_Back_Server_Request_Processor.action} */
    const process = spec['TeqFw_Http2_Back_Server_Request_Processor$'];

    // DEFINE INNER FUNCTIONS

    /**
     * Handler to process 'stream' events.
     *
     * @param {ServerHttp2Stream} stream
     * @param {Object<String, String>} headers
     * @param {Number} flags
     * @memberOf TeqFw_Http2_Back_Server_Stream
     */
    async function action(stream, headers, flags) {
        // DEFINE INNER FUNCTIONS
        /**
         * Validate HTTP/1 request method. 'GET' & 'HEAD' methods must be always allowed.
         *
         * @param {Object<string, string>} headers
         * @returns {boolean}
         */
        function hasValidMethod(headers) {
            const method = headers[H2.HTTP2_HEADER_METHOD];
            return (method === H2.HTTP2_METHOD_HEAD) ||
                (method === H2.HTTP2_METHOD_GET) ||
                (method === H2.HTTP2_METHOD_POST);
        }

        /**
         * Log request data.
         *
         * @param {Object<string, string>} headers
         */
        function logRequest(headers) {
            const method = headers[H2.HTTP2_HEADER_METHOD];
            const path = headers[H2.HTTP2_HEADER_PATH];
            logger.debug(`${method} ${path}`);
        }

        /**
         * @param {ServerHttp2Stream} stream
         */
        function respond405(stream) {
            stream.respond({
                [H2.HTTP2_HEADER_STATUS]: H2.HTTP_STATUS_METHOD_NOT_ALLOWED,
                [H2.HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8'
            });
            stream.end('Only HEAD, GET and POST methods are allowed.');
        }

        /**
         * Close stream on any error.
         *
         * @param {ServerHttp2Stream} stream
         * @param {Error} err
         */
        function respond500(stream, err) {
            const stack = (err.stack) ?? '';
            const message = err.message ?? 'Unknown error';
            const error = {message, stack};
            const str = JSON.stringify({error});
            console.error(str);
            if (stream.writable) {
                stream.respond({
                    [H2.HTTP2_HEADER_STATUS]: H2.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                    [H2.HTTP2_HEADER_CONTENT_TYPE]: 'application/json'
                });
                stream.end(str);
            }
        }

        // MAIN FUNCTIONALITY
        logRequest(headers);

        // Analyze input and define type of the request (api or static)
        if (hasValidMethod(headers)) {
            try {
                // buffer to collect input data for POSTs
                const chunks = [];
                // collect input data into array of chunks (if exists)
                stream.on('data', (chunk) => chunks.push(chunk));
                // continue process after input has been read
                stream.on('end', () => process(stream, headers, flags, chunks));
                stream.on('error', (err) => respond500(stream, err));
            } catch (err) {
                respond500(stream, err);
            }
        } else {
            // Request method is not allowed.
            respond405(stream);
        }
    }

    // COMPOSE RESULT
    Object.defineProperty(action, 'name', {value: `${NS}.${action.name}`});
    return action;

}

// MODULE'S EXPORT
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.name}`});
export {
    Factory as default,
};
