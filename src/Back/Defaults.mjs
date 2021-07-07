/**
 * Plugin constants (hardcoded configuration) for backend code.
 */
export default class TeqFw_Http2_Back_Defaults {

    CLI_PREFIX = 'http2'; // prefix in CLI commands.
    DATA_FILE_PID = './var/http2.pid'; // PID file to stop running server.

    /** @type {TeqFw_Web_Back_Defaults} */
    MOD_WEB = null;

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Web_Back_Defaults} */
        this.MOD_WEB = spec['TeqFw_Web_Back_Defaults$'];

        // MAIN FUNCTIONALITY
        Object.freeze(this);
    }
}
