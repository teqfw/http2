import {constants as H2} from 'http2';

/**
 * Data structure to group input data for the 'middleware' handlers.
 */
class TeqFw_Http2_Back_Server_Stream_Context {
    /** @type {String} */
    body;
    /** @type {Number} */
    flags;
    /** @type {Object.<String, String>} */
    headers;
    /** @type {TeqFw_Http2_Back_Server_Stream_Shared} */
    shared;
}

/**
 * Data structure to group 'middleware' handler's processing results (output headers, body, etc.).
 */
class TeqFw_Http2_Back_Server_Stream_Report {
    /**
     * 'true' if current handler has processed the request completely.
     * @type {Boolean}
     */
    complete = false;
    /**
     * Full name of the file to send to a client.
     * @type {String}
     */
    filepath;
    /**
     * Headers to add to output on response.
     * @type {Object.<String, String>}
     */
    headers = {};
    /**
     * String or buffer to send to a client.
     * @type {String|Buffer}
     */
    output;
    /**
     * Additional shared objects to be added to input context for remaining handlers.
     * @type {TeqFw_Http2_Back_Server_Stream_Shared}
     */
    sharedAdditional = new TeqFw_Http2_Back_Server_Stream_Shared();
}

/**
 * Data structure to group transient data being shared between handlers. This is simple object to store shared data
 * related to one HTTP2 request. This context is shared between handlers (ACL and API services, for example).
 *
 * See 'HTTP_SHARE_CTX_...' keys in plugins Default-objects.
 *
 * It is not a good solution but it is flexible solution. I need the flexibility for the time.
 *
 */
class TeqFw_Http2_Back_Server_Stream_Shared {
}

/**
 * Factory to create handler for server's streams.
 */
class TeqFw_Http2_Back_Server_Stream {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Di_Container} */
        const container = spec['TeqFw_Di_Container$']; // singleton
        /** @type {TeqFw_Core_Logger} */
        const logger = spec['TeqFw_Core_Logger$']; // singleton
        /** @type {TeqFw_Core_Back_Scan_Plugin_Registry} */
        const registry = spec['TeqFw_Core_Back_Scan_Plugin_Registry$']; // singleton
        /** @type {TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler.Factory} */
        const fHandler = spec['TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler#Factory$']; // singleton

        // PARSE INPUT & DEFINE WORKING VARS
        /** @type {Array.<function>} */
        const handlers = [];  // ordered array with handlers

        // DEFINE INNER FUNCTIONS

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

        /**
         * Process HTTP request after body has been read. Run handlers one by one and write out result when
         * any handler reports about processing of the request.
         *
         * @param {ServerHttp2Stream} stream
         * @param {Object<string, string>} headers
         * @param {number} flags
         * @param {string} body
         * @returns {Promise<void>}
         */
        async function requestHandler(stream, headers, flags, body) {

            // DEFINE INNER FUNCTIONS

            /**
             * Validate HTTP request method. 'GET' & 'HEAD' methods must be always allowed.
             *
             * @param {Object<String, String>} headers
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
             * @param {Object<String, String>} headers
             */
            function logRequest(headers) {
                const method = headers[H2.HTTP2_HEADER_METHOD];
                const path = headers[H2.HTTP2_HEADER_PATH];
                logger.debug(`${method} ${path}`);
            }

            /**
             * @param {ServerHttp2Stream} stream
             */
            function respond404(stream) {
                stream.respond({
                    [H2.HTTP2_HEADER_STATUS]: H2.HTTP_STATUS_NOT_FOUND,
                    [H2.HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8'
                });
                const content = 'Appropriate handler is not found for this request.';
                stream.end(content);
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
             * Write out complete result to the stream.
             * @param {ServerHttp2Stream} stream
             * @param {TeqFw_Http2_Back_Server_Stream_Report} report
             */
            function respondComplete(stream, report) {
                if (stream.writable) {
                    if (report.filepath) {
                        stream.respondWithFile(report.filepath, report.headers);
                    } else {
                        stream.respond(report.headers);
                        stream.end(report.output);
                    }
                }
            }

            // MAIN FUNCTIONALITY
            logRequest(headers);

            // Analyze input and define type of the request (api or static)
            if (hasValidMethod(headers)) {
                try {
                    // init request context (contains all data required for current request processing)
                    const context = Object.assign(
                        new TeqFw_Http2_Back_Server_Stream_Context(),
                        {headers, flags, body}
                    );
                    context.shared = new TeqFw_Http2_Back_Server_Stream_Shared();
                    let result = new TeqFw_Http2_Back_Server_Stream_Report();
                    for (const handler of handlers) {
                        /** @type {TeqFw_Http2_Back_Server_Stream_Report} */
                        const report = await handler(context);
                        // cookie should be merged in headers, not rewritten
                        Object.assign(result.headers, report.headers);  // add additional headers to results
                        Object.assign(context.shared, report.sharedAdditional); // add shared objects to context
                        if (report.output) result.output = report.output;
                        if (report.filepath) result.filepath = report.filepath;
                        if (report.complete) {
                            result.complete = true;
                            break;
                        }
                    }
                    // write out processing result
                    if (result.complete) {
                        respondComplete(stream, result);
                    } else {
                        respond404(stream);
                    }
                } catch (e) {
                    respond500(stream, e);
                }
            } else {
                // Request method is not allowed.
                respond405(stream);
            }
        }

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)

        /**
         * Factory function to create handler for 'Http2Server.stream' events.
         * @returns {Promise<TeqFw_Http2_Back_Server_Stream.handler>}
         */
        this.createHandler = async function () {
            // DEFINE INNER FUNCTIONS
            async function initHandlers() {
                const result = [], hndlReg = [];
                const ID = 'id', DESC = 'desc', HNDL = 'handler';
                // analyze plugins and create handlers
                const plugins = registry.items();
                for (const plugin of plugins) {
                    if (Array.isArray(plugin.teqfw?.http2?.handlers)) {
                        const handlers = plugin.teqfw.http2.handlers;
                        for (const one of handlers) {
                            /** @type {TeqFw_Http2_Back_Api_Dto_Plugin_Desc_Handler} */
                            const data = fHandler.create(one);
                            const hndl = await container.get(`${data.factoryId}$`);
                            hndlReg.push({[ID]: data.factoryId, [HNDL]: hndl, [DESC]: data});
                        }
                    }
                }
                // organize handlers by priority
                hndlReg.sort((a, b) => {
                    const weightA = a[DESC]?.weight ?? 0;
                    const weightB = b[DESC]?.weight ?? 0;
                    return weightB - weightA; // reverse order, from the largest to the smallest
                })
                for (const one of hndlReg) result.push(one[HNDL]);
                return result;
            }

            // MAIN FUNCTIONALITY
            const hndlsToAdd = await initHandlers();
            handlers.push(...hndlsToAdd);


            // DEFINE INNER FUNCTIONS
            /**
             * Handler to process 'stream' events.
             *
             * @param {ServerHttp2Stream} stream
             * @param {Object<String, String>} headers
             * @param {Number} flags
             * @memberOf TeqFw_Http2_Back_Server_Stream
             */
            async function handler(stream, headers, flags) {
                try {
                    // buffer to collect input data for POSTs
                    const chunks = [];
                    /* Available events for 'Http2Stream':
                    *   - aborted
                    *   - close
                    *   - error
                    *   - frameError
                    *   - ready
                    *   - timeout
                    *   - trailers
                    *   - wantTrailers
                    * events from 'stream.Readable':
                    *   - close
                    *   - data
                    *   - end
                    *   - error
                    *   - pause
                    *   - readable
                    *   - resume
                    * events from 'stream.Writable':
                    *   - close
                    *   - drain
                    *   - error
                    *   - finish
                    *   - pipe
                    *   - unpipe
                    */
                    // collect input data into array of chunks (if exists)
                    stream.on('data', (chunk) => chunks.push(chunk));
                    // continue process after input has been read
                    stream.on('end', () => requestHandler(stream, headers, flags, Buffer.concat(chunks).toString()));
                    stream.on('error', (err) => respond500(stream, err));
                } catch (err) {
                    respond500(stream, err);
                }
            }

            // COMPOSE RESULT
            Object.defineProperty(handler, 'name', {value: `${this.constructor.name}.${handler.name}`});
            return handler;
        };
    }

}

export {
    TeqFw_Http2_Back_Server_Stream as default,
    TeqFw_Http2_Back_Server_Stream_Context as Context,
    TeqFw_Http2_Back_Server_Stream_Report as Report,
    TeqFw_Http2_Back_Server_Stream_Shared as Shared,
};
