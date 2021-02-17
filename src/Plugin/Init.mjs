/**
 * Class to integrate plugin into TeqFW application.
 * @extends TeqFw_Core_App_Plugin_Init_Base
 */
export default class TeqFw_Http2_Plugin_Init {

    constructor(spec) {
        /** @type {TeqFw_Http2_Defaults} */
        const DEF = spec['TeqFw_Http2_Defaults$'];    // instance singleton

        this.getCommands = function () {
            return [];
        };

        this.getHttp2StaticMaps = function () {
            return {
                '/vue/': '/vue/dist/',
            };
        };

        this.getHttp2BackRealm = function () {
            return DEF.BACK_REALM;
        };

        this.getHttp2Services = function () {
            return [
                'TeqFw_Http2_Back_Service_Some$',
            ];
        };
    }


}
