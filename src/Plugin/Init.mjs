/**
 * Class to integrate plugin into TeqFW application.
 * @extends TeqFw_Core_App_Plugin_Init_Base
 */
export default class Vendor_Project_Plugin_Init {

    constructor(spec) {
        /** @type {Vendor_Project_Defaults} */
        const DEF = spec['Vendor_Project_Defaults$'];    // instance singleton

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
                'Vendor_Project_Back_Service_Some$',
            ];
        };
    }


}
