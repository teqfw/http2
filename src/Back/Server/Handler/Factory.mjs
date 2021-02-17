/**
 * Defined interface for HTTP2 requests handlers and its factories.
 * This class is a template to create new handlers factories. Known factories are:
 *  - TeqFw_Http2_Back_Server_Handler_Api
 *  - TeqFw_Http2_Back_Server_Handler_Static
 *  - Fl32_Teq_User_App_Server_Handler_Session
 *
 *  @interface
 */
export default class TeqFw_Http2_Back_Server_Handler_Factory {

    /**
     * @param {TeqFw_Di_SpecProxy} spec
     */
    constructor(spec) {
        /** @type {TeqFw_Core_App_Logger} */
        const logger = spec['TeqFw_Core_App_Logger$'];  // instance singleton
        /** @type {typeof TeqFw_Http2_Back_Server_Stream_Report} */
        const Report = spec['TeqFw_Http2_Back_Server_Stream#Report'];   // class constructor

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)

        /**
         * Create handler to process HTTP2 requests.
         * @returns {Promise<TeqFw_Http2_Back_Server_Handler_Factory.handler>}
         */
        this.createHandler = async function () {
            // DEFINE INNER FUNCTIONS
            /**
             *
             * @param {TeqFw_Http2_Back_Server_Stream_Context} context
             * @returns {Promise<TeqFw_Http2_Back_Server_Stream_Report>}
             * @memberOf TeqFw_Http2_Back_Server_Handler_Factory
             * @interface
             */
            async function handler(context) {
                // PARSE INPUT & DEFINE WORKING VARS
                // DEFINE INNER FUNCTIONS
                // MAIN FUNCTIONALITY
                let result = new Report();
                try {
                    // process request, compose response and write it to the 'stream'
                    result.output = '<p>content</p>';
                    result.complete = true;  // set 'true' if request is completely processed
                } catch (e) {
                    debugger;
                }
                return result;
            }

            // MAIN FUNCTIONALITY
            const name = `${this.constructor.name}.${handler.name}`;
            logger.debug(`HTTP2 requests handler '${name}' is created.`);
            // COMPOSE RESULT
            Object.defineProperty(handler, 'name', {value: name});
            return handler;
        };
    }
}

