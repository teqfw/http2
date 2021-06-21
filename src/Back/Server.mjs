import http2 from 'http2';

/**
 * HTTP2 server for the application.
 */
export default class TeqFw_Http2_Back_Server {

    constructor(spec) {
        // CONSTRUCTOR INJECTED DEPS
        /** @type {TeqFw_Http2_Back_Server_Stream} */
        const factHndlStream = spec['TeqFw_Http2_Back_Server_Stream$'];   // singleton

        // INIT OWN PROPERTIES AND DEFINE WORKING VARS
        /** @type {Http2Server} */
        let server;

        // DEFINE THIS INSTANCE METHODS

        /**
         * Create HTTP2 server and set event handlers.
         *
         * @returns {Promise<void>}
         */
        this.init = async function () {
            // PARSE INPUT & DEFINE WORKING VARS
            /** @type {TeqFw_Http2_Back_Server_Stream.handler} */
            const onStreamHndl = await factHndlStream.createHandler();

            // DEFINE INNER FUNCTIONS

            /**
             * Unhandled server error ('server is down').
             *
             * @param err
             */
            function onErrorHndl(err) {
                console.log('Server error: ' + err);
                // debugger;
            }

            // MAIN FUNCTIONALITY
            server = http2.createServer();
            /* Available events for 'Http2Server':
            *   - checkContinue
            *   - connection
            *   - request
            *   - session
            *   - sessionError
            *   - stream
            *   - timeout
            * events from 'net.Server':
            *   - close
            *   - connection
            *   - error
            *   - listening
            */
            server.on('error', onErrorHndl);
            server.on('stream', onStreamHndl);
        };

        /**
         * Run HTTP2 server.
         *
         * @param {number} port
         */
        this.listen = function (port) {
            server.listen(port);
        };
    }
}
