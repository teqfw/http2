/**
 * Plugin level constants (hardcoded configuration).
 */
export default class TeqFw_Http2_Back_Defaults {
    API_LOAD_CFG = '/load/config';
    API_LOAD_NS = '/load/namespaces';

    DATA = {
        FILE_PID: './var/http2.pid', // PID file to stop running server.
    };

    FS_SRC = 'src'; // default folder for plugin's static resources in filesystem
    FS_WEB = 'web'; // default folder for plugin's static resources in filesystem


    /**
     * Used in CLI commands and 'teqfw.json' descriptors.
     * @type {string}
     */
    REALM = 'http2';

    ZONE_API = 'api';    // URL prefix for API requests: https://.../area/api/...
    ZONE_SRC = 'src';    // URL prefix for ES6/JS sources: https://.../area/src/...
    ZONE_WEB = 'web';    // URL prefix for static files: https://.../area/web/...

    /**
     * Pin dependencies DEFAULTS.
     */
    MOD = {
        /** @type {TeqFw_Web_Back_Defaults} */
        WEB: null
    };

    // references to other props
    HTTP_SHARE_HEADERS = `${this.REALM}/headers`; // Attribute of the HTTP context to share HTTP headers.

    constructor(spec) {
        /** @type {TeqFw_Web_Back_Defaults} */
        this.MOD.WEB = spec['TeqFw_Web_Back_Defaults$'];

        Object.freeze(this);
    }
}
