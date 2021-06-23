/**
 * Frontend gate to "Save one field of user profile" service.
 */
export default function TeqFw_Http2_Front_Gate_Load_Config(spec) {
    /** @type {TeqFw_Core_Defaults} */
    const DEF = spec['TeqFw_Core_Defaults$'];   // singleton
    /** @type {TeqFw_Core_Front_Data_Config} */
    const config = spec['TeqFw_Core_Front_Data_Config$']; // singleton
    /** @type {TeqFw_Di_Container} */
    const container = spec['TeqFw_Di_Container$'];  // singleton
    /** @type {typeof TeqFw_Core_Shared_Service_Route_Load_Config_Response} */
    const Response = spec['TeqFw_Core_Shared_Service_Route_Load_Config#Response']; // class
    /** @type {typeof TeqFw_Http2_Front_Gate_Response_Error} */
    const GateError = spec['TeqFw_Http2_Front_Gate_Response_Error#'];    // class

    // TODO: we need to map gate to API URI
    const URL = `https://${config.urlBase}/api/${DEF.API_LOAD_CFG}`;

    /**
     * @param {TeqFw_Core_Shared_Service_Route_Load_Config_Request} data
     * @returns {Promise<TeqFw_Core_Shared_Service_Route_Load_Config_Response|TeqFw_Http2_Front_Gate_Response_Error>}
     * @memberOf TeqFw_Http2_Front_Gate_Load_Config
     */
    async function gate(data) {
        try {
            // TODO: ajax loader interface from core should be here
            const store = await container.get(DEF.DI_STORE); // singleton
            store.commit('app/startLoader');
            const res = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({data})
            });
            store.commit('app/stopLoader');
            const json = await res.json();
            /** @type {TeqFw_Core_Shared_Service_Route_Load_Config_Response} */
            const result = new Response();
            Object.assign(result, json.data);
            return result;
        } catch (e) {
            // infrastructure error
            const result = new GateError();
            result.error = Object.assign({}, e);
            if (e.message) result.message = e.message;
            return result;
        }
    }

    // COMPOSE RESULT
    Object.defineProperty(gate, 'name', {value: 'TeqFw_Http2_Front_Gate_Load_Config.gate'});
    return gate;
}

