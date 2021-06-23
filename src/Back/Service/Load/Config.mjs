/**
 * Load local configuration data available for the front areas.
 */
class TeqFw_Http2_Back_Service_Load_Config {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Core_Defaults} */
        const DEF = spec['TeqFw_Core_Defaults$'];
        /** @type {TeqFw_Core_Back_Config} */
        const config = spec['TeqFw_Core_Back_Config$'];  // singleton
        /** @type {typeof TeqFw_Core_Shared_Service_Route_Load_Config_Request} */
        const Request = spec['TeqFw_Core_Shared_Service_Route_Load_Config#Request'];   // class
        /** @type {typeof TeqFw_Core_Shared_Service_Route_Load_Config_Response} */
        const Response = spec['TeqFw_Core_Shared_Service_Route_Load_Config#Response']; // class

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)
        // this.createInputParser = function () {};

        this.createService = function () {
            /**
             * @returns {Promise<{response: TeqFw_Core_Shared_Service_Route_Load_Config_Response}>}
             * @memberOf TeqFw_Http2_Back_Service_Load_Config
             */
            async function service() {
                const cfg = config.get();
                /** @type {TeqFw_Core_Shared_Service_Route_Load_Config_Response} */
                const response = Object.assign(new Response(), cfg.local.web);
                return {response};
            }

            // COMPOSE RESULT
            // add namespace marker to the object name
            Object.defineProperty(service, 'name', {
                value: `${this.constructor.name}.${service.name}`,
            });
            return service;
        };

        this.getRoute = function () {
            return DEF.API_LOAD_CFG;
        };
    }
}

export default TeqFw_Http2_Back_Service_Load_Config;
