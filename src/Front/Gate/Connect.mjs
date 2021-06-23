/**
 * Used by gates to connect to backend services (API).
 */
export default class TeqFw_Http2_Front_Gate_Connect {
    constructor(spec) {
        /** @type {TeqFw_Http2_Defaults} */
        const DEF = spec['TeqFw_Http2_Defaults$']; // singleton
        /** @type {TeqFw_Core_Front_Data_Config} */
        const config = spec['TeqFw_Core_Front_Data_Config$']; // singleton
        /** @type {TeqFw_Http2_Front_Gate_Connect_AjaxLed} */
        const ajaxLed = spec['TeqFw_Http2_Front_Gate_Connect_AjaxLed$']; // singleton
        /** @type {TeqFw_Http2_Front_Gate_Connect_ErrorHandler} */
        const errHndl = spec['TeqFw_Http2_Front_Gate_Connect_ErrorHandler$']; // singleton

        const BASE = `https://${config.urlBase}/${config.area}/${DEF.ZONE_API}`;

        /**
         * Send API service request to backend.
         *
         * @param {Object} data JS-object to be sent as request
         * @param {String} realm 'user'
         * @param {String} route '/path/to/service'
         * @returns {Promise<Object|Boolean>}
         */
        this.send = async function (data, realm, route) {
            let result = false;
            ajaxLed.on();
            try {
                const URL = `${BASE}/${realm}${route}`;
                const res = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({data})
                });
                const json = await res.json();
                if (json.data) {
                    result = json.data;  // normal result
                } else {
                    errHndl.business(json.error);
                }
                return result;
            } catch (e) {
                errHndl.infrastructure(e);
            } finally {
                ajaxLed.off();
            }
        };
    }

}
