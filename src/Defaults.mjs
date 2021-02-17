export default class TeqFw_Http2_Defaults {
    BACK_REALM = 'http2';  // realm for API services ('/api/http2/...') and CLI commands ('http2-...')
    PID_FILE_NAME = './var/server.pid'; // PID file to stop running server.
    SERVER_DEFAULT_PORT = 3000; // Default port for listing.

    /** @type {TeqFw_Core_App_Defaults} */
    MOD_CORE;

    constructor(spec) {
        /** @type {TeqFw_Core_App_Defaults} */
        this.MOD_CORE = spec['TeqFw_Core_App_Defaults$'];    // pin 'core' defaults
        Object.freeze(this);
    }
}
