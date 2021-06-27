/**
 * Factory to create handler for static files.
 *
 * @namespace TeqFw_Http2_Plugin_Handler_Static
 */
// MODULE'S IMPORT
import $fs from 'fs';
import $mimeTypes from 'mime-types';
import $path from 'path';
import {constants as H2} from 'http2';

// MODULE'S VARS
const NS = 'TeqFw_Http2_Plugin_Handler_Static';
const INDEX_NAME = 'index.html';

/**
 * Factory to create HTTP2 requests handler to process static files.
 *
 * @param {TeqFw_Di_SpecProxy} spec
 * @return {Promise<function(TeqFw_Http2_Back_Server_Stream_Context): TeqFw_Http2_Back_Server_Stream_Report>}
 * @constructor
 * @memberOf TeqFw_Http2_Plugin_Handler_Static
 */
async function Factory(spec) {
    // EXTRACT DEPS
    /** @type {TeqFw_Http2_Defaults} */
    const DEF = spec['TeqFw_Http2_Defaults$']; // singleton
    /** @type {TeqFw_Di_Container} */
    const container = spec['TeqFw_Di_Container$']; // singleton
    /** @type {TeqFw_Core_Back_Config} */
    const config = spec['TeqFw_Core_Back_Config$']; // singleton
    /** @type {TeqFw_Core_Logger} */
    const logger = spec['TeqFw_Core_Logger$']; // singleton
    /** @type {TeqFw_Core_Back_Scan_Plugin_Registry} */
    const regPlugins = spec['TeqFw_Core_Back_Scan_Plugin_Registry$']; // singleton
    /** @type {TeqFw_Http2_Back_Model_Realm_Registry} */
    const regAreas = spec['TeqFw_Http2_Back_Model_Realm_Registry$']; // singleton
    /** @type {typeof TeqFw_Http2_Back_Server_Stream_Report} */
    const Report = spec['TeqFw_Http2_Back_Server_Stream#Report']; // class

    // PARSE INPUT & DEFINE WORKING VARS
    const rootFs = config.get('/path/root');    // path to project root
    const rootWeb = $path.join(rootFs, DEF.FS_WEB);    // default path to app web root
    const mapRoutes = {};   // '/src/@teqfw/core' => '/.../node_modules/@teqfw/core/src'

    // DEFINE INNER FUNCTIONS
    /**
     *
     * @param {TeqFw_Http2_Back_Server_Stream_Context} context
     * @returns {Promise<TeqFw_Http2_Back_Server_Stream_Report>}
     * @memberOf TeqFw_Http2_Plugin_Handler_Static
     */
    async function handleHttp2Request(context) {
        // DEFINE INNER FUNCTIONS
        /**
         * Compose absolute path to requested resource:
         *  - /src/vue/vue.global.js => /.../node_modules/vue/dist/vue.global.js
         *  - /web/@flancer32/teqfw-app-sample/favicon.ico => /.../@flancer32/teqfw-app-sample/web/favicon.ico
         *  - /index.html => /.../web/index.html
         *
         * @param {String} url
         * @returns {String}
         */
        function getPath(url) {

            // DEFINE INNER FUNCTIONS
            function normalize(path) {
                let result = path;
                const addr = regAreas.parseAddress(path);
                if (addr.zone !== undefined) {
                    result = `/${addr.zone}${addr.route}`;
                } else if (addr.area !== undefined) {
                    result = `/${addr.area}${addr.route}`;
                } else {
                    result = `${addr.route}`;
                }
                // add 'index.html' for 'web' area
                if (
                    (addr.zone !== DEF.ZONE_API) &&
                    (addr.zone !== DEF.ZONE_SRC) &&
                    (result.slice(-1) === '/')
                ) {
                    result += INDEX_NAME;
                }
                return result;
            }

            function pathMap(url) {
                let result = url;
                for (const key in mapRoutes) {
                    const one = mapRoutes[key];
                    const regSrc = new RegExp(`(.*)(${key})(.*)`);
                    const partsSrc = regSrc.exec(url);
                    if (Array.isArray(partsSrc)) {
                        const tail = partsSrc[3];
                        result = `${one}/${tail}`;
                        result = result.replace(/\/\//g, '/');
                        break;
                    }
                }
                return result;
            }

            // MAIN FUNCTIONALITY
            let result;
            const normal = normalize(url);
            const mapped = pathMap(normal);
            if (normal === mapped) {   // URL w/o mapping should be resolved relative to web root
                result = $path.join(rootWeb, normal);
            } else {    // URL w mapping should be resolved relative to project root
                result = mapped;
            }
            return result;
        }

        // MAIN FUNCTIONALITY
        const result = new Report();
        /** @type {Object<String, String>} */
        const headers = context.headers;
        const webPath = headers[H2.HTTP2_HEADER_PATH];
        const path = getPath(webPath);
        if ($fs.existsSync(path) && $fs.statSync(path).isFile()) {
            const mimeType = $mimeTypes.lookup(path);
            if (mimeType) {
                result.headers[H2.HTTP2_HEADER_STATUS] = H2.HTTP_STATUS_OK;
                result.headers[H2.HTTP2_HEADER_CONTENT_TYPE] = mimeType;
                result.filepath = path;
                result.complete = true;
            }
        }
        return result;
    }

    // MAIN FUNCTIONALITY
    // compose static routes map for plugins
    logger.debug('Map plugins folders for static resources:');
    const items = regPlugins.items();
    for (const item of items) {
        // map URLs to filesystem for ES6/JS sources
        const srcUrl = $path.join('/', DEF.ZONE_SRC, item.name);
        const srcPath = $path.join(item.path, DEF.FS_SRC);
        mapRoutes[srcUrl] = srcPath;
        logger.debug(`    ${srcUrl} => ${srcPath}`);
        // map URLs to filesystem for static resources
        const statUrl = $path.join('/', DEF.ZONE_WEB, item.name);
        const statPath = $path.join(item.path, DEF.FS_WEB);
        mapRoutes[statUrl] = statPath;
        logger.debug(`    ${statUrl} => ${statPath}`);
        // map additional resources
        if (typeof item.teqfw?.http2?.statics === 'object') {
            const map = item.teqfw?.http2?.statics;
            for (const key in map) {
                const url = $path.join('/', DEF.ZONE_SRC, key);
                const path = $path.join(rootFs, 'node_modules', map[key]);
                mapRoutes[url] = path;
                logger.debug(`    ${url} => ${path}`);
            }
        }
    }

    // COMPOSE RESULT
    Object.defineProperty(handleHttp2Request, 'name', {value: `${NS}.${handleHttp2Request.name}`});
    return handleHttp2Request;
}

// MODULE'S EXPORT
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
export default Factory;
