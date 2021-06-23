/**
 * Plugin level constants (hardcoded configuration).
 */
export default class TeqFw_Http2_Defaults {
    API_LOAD_NS = '/load/namespaces';

    BACK_REALM = 'http2';  // realm for API services ('/api/http2/...') and CLI commands ('http2-...')

    FS_SRC = 'src'; // default folder for plugin's static resources in filesystem
    FS_WEB = 'web'; // default folder for plugin's static resources in filesystem

    HTTP_SHARE_HEADERS = `${this.BACK_REALM}/headers`; // Attribute of the HTTP context to share HTTP headers.
    PID_FILE_NAME = './var/server.pid'; // PID file to stop running server.
    SERVER_DEFAULT_PORT = 3000; // Default port for listing.

    ZONE_API = 'api';    // URL prefix for API requests: https://.../area/api/...
    ZONE_SRC = 'src';    // URL prefix for ES6/JS sources: https://.../area/src/...
    ZONE_WEB = 'web';    // URL prefix for static files: https://.../area/web/...

    /** @type {TeqFw_Core_App_Defaults} */
    MOD_CORE;

    constructor(spec) {
        /** @type {TeqFw_Core_App_Defaults} */
        this.MOD_CORE = spec['TeqFw_Core_App_Defaults$'];    // pin 'core' defaults
        Object.freeze(this);
    }
}
