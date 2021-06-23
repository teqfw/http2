/**
 * Class to integrate plugin into TeqFW application.
 * @extends TeqFw_Core_Plugin_Init_Base
 */
export default class TeqFw_Http2_Plugin_Init {

    constructor(spec) {
        /** @type {TeqFw_Http2_Defaults} */
        const DEF = spec['TeqFw_Http2_Defaults$'];    // singleton

        this.getCommands = function () {
            return [
                'TeqFw_Http2_Back_Cli_Start$',
                'TeqFw_Http2_Back_Cli_Stop$',
            ];
        };

        this.getHttpStaticMaps = function () {
            return {
                '/web/path/': '/fs/path/',
            };
        };

        this.getServicesRealm = function () {
            return DEF.BACK_REALM;
        };

        this.getServicesList = function () {
            return [
                // 'TeqFw_Http2_Back_Service_Some$',
            ];
        };
    }


}
