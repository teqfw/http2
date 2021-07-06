/**
 * Plugin level constants (hardcoded configuration).
 */
export default class TeqFw_Http2_Back_Defaults {

    DATA = {
        FILE_PID: './var/http2.pid', // PID file to stop running server.
    };

    /**
     * Pin dependencies DEFAULTS.
     */
    MOD = {
        /** @type {TeqFw_Web_Back_Defaults} */
        WEB: null
    };

    /**
     * Used in CLI commands and 'teqfw.json' descriptors.
     * @type {string}
     */
    REALM = 'http2';

    constructor(spec) {
        /** @type {TeqFw_Web_Back_Defaults} */
        this.MOD.WEB = spec['TeqFw_Web_Back_Defaults$'];

        Object.freeze(this);
    }
}
