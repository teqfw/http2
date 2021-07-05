/**
 * Plugin constants (hardcoded configuration) for shared code.
 */
export default class TeqFw_Http2_Shared_Defaults {
    NAME = '@teqfw/http2';

    MOD = {
        /** @type {TeqFw_Web_Shared_Defaults} */
        WEB: null
    }

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Web_Shared_Defaults} */
        this.MOD.WEB = spec['TeqFw_Web_Shared_Defaults$'];

        // MAIN FUNCTIONALITY
        Object.freeze(this);
    }
}
