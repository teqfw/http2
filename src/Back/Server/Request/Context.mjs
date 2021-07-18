/**
 * Request context model for & HTTP/2 server.
 *
 * @namespace TeqFw_Http2_Back_Server_Request_Context
 */
// MODULE'S IMPORT
import {constants as H2} from 'http2';
// MODULE'S VARS
const NS = 'TeqFw_Http2_Back_Server_Request_Context';

// MODULE'S CLASSES
/**
 * @implements TeqFw_Web_Back_Api_Request_IContext
 */
class TeqFw_Http2_Back_Server_Request_Context {
    /** @type {Object} */
    handlersShare;
    /** @type {number} */
    http2Flags;
    /** @type {Object<string, string>} */
    http2Headers;
    /** @type {ServerHttp2Stream} */
    http2Stream;
    /** @type {Buffer[]} */
    inputData;
    /**
     * HTTP request is completely processed by handler (all data is sent to client).
     * @type {boolean}
     */
    requestComplete;
    /**
     * HTTP request is processed (response data is created) but response is not sent to client.
     * @type {boolean}
     */
    requestProcessed;
    /** @type {string} */
    responseBody;
    /** @type {string} */
    responseFilePath;
    /** @type {Object<string, string>} */
    responseHeaders;

    // DEFINE PROTO METHODS
    /**
     * Get object that is shared between all handlers.
     * @return {Object}
     */
    getHandlersShare() {
        return this.handlersShare;
    }

    getInputData() {
        return this.inputData;
    }

    getPath() {
        return this.http2Headers[H2.HTTP2_HEADER_PATH];
    }

    /**
     * @returns {Object<string, string>}
     */
    getRequestHeaders() {
        return this.http2Headers;
    }

    /**
     * @returns {string}
     */
    getResponseBody() {
        return this.responseBody;
    }

    /**
     * @returns {string}
     */
    getResponseFilePath() {
        return this.responseFilePath;
    }

    /**
     * @returns {Object<string, string>}
     */
    getResponseHeaders() {
        return this.responseHeaders;
    }

    isRequestComplete() {
        return this.requestComplete;
    }

    isRequestProcessed() {
        return this.requestProcessed;
    }

    setInputData(chunks) {
        this.inputData = chunks;
    }

    markRequestComplete() {
        this.requestComplete = true;
    }

    markRequestProcessed() {
        this.requestProcessed = true;
    }

    /**
     * Init request context with HTTP/2 data.
     * @param {ServerHttp2Stream} stream
     * @param {Object<string, string>} headers
     * @param {number} flags
     * @param {Buffer[]} chunks
     */
    setRequestContext({stream, headers, flags, chunks}) {
        this.http2Stream = stream;
        this.http2Headers = headers;
        this.http2Flags = flags;
        this.inputData = chunks;
    }

    setResponseBody(data) {
        this.responseBody = data;
    }

    setResponseFilePath(path) {
        this.responseFilePath = path;
    }

    setResponseHeader(key, value) {
        if (key === H2.HTTP2_HEADER_SET_COOKIE) {
            if (this.responseHeaders[key]) {
                // merge cookies
                this.responseHeaders[key] += `;${value}`;
            } else {
                // add cookie
                this.responseHeaders[key] = value;
            }
        } else {
            this.responseHeaders[key] = value;
        }
    }
}

/**
 * Factory to create new instances.
 * @memberOf TeqFw_Http2_Back_Server_Request_Context
 */
class Factory {
    constructor() {
        /**
         * @param {TeqFw_Http2_Back_Server_Request_Context|null} data
         * @return {TeqFw_Http2_Back_Server_Request_Context}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Http2_Back_Server_Request_Context();
            res.handlersShare = (typeof data?.handlersShare === 'object') ? data.handlersShare : {};
            res.http2Flags = data?.http2Flags;
            res.http2Headers = (typeof data?.http2Headers === 'object') ? data.http2Headers : {};
            res.http2Stream = data?.http2Stream;
            res.requestComplete = data?.requestComplete ?? false;
            res.requestProcessed = data?.requestProcessed ?? false;
            res.responseBody = data?.responseBody;
            res.responseFilePath = data?.responseFilePath;
            res.responseHeaders = (typeof data?.responseHeaders === 'object') ? data.responseHeaders : {};
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Http2_Back_Server_Request_Context);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
export {
    TeqFw_Http2_Back_Server_Request_Context as default,
    Factory
};
