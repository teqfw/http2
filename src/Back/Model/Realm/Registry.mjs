/**
 * Registry for HTTP/2 server frontend realms.
 *
 * @namespace TeqFw_Http2_Back_Model_Realm_Registry
 */
// MODULE'S VARS
const NS = 'TeqFw_Http2_Back_Model_Realm_Registry';

// MODULE'S CLASSES
/**
 * Structure to represent address (URL).
 * General form: https://hostname.com/root/lang/realm/area/route/to/resource
 * @memberOf TeqFw_Http2_Back_Model_Realm_Registry
 */
class Address {
    // DEFINE PROPS
    area;
    lang;
    realm;
    root;
    route;
}

/**
 * Registry for HTTP/2 server realms.
 */
class TeqFw_Http2_Back_Model_Realm_Registry {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Core_App_Defaults} */
        const DEF = spec['TeqFw_Core_App_Defaults$']; // instance singleton
        /** @type {TeqFw_Core_App_Plugin_Registry} */
        const regPlugins = spec['TeqFw_Core_App_Plugin_Registry$'];   // instance singleton
        /** @type {String[]} internal store for realms */
        let registry = [];

        // DEFINE INNER FUNCTIONS

        // DEFINE INSTANCE METHODS
        /**
         * Parser to decompose URL path to the parts.
         * @param {String} path (/root/lang/realm/area/route/to/resource)
         * @returns {TeqFw_Http2_Back_Model_Realm_Registry.Address}
         */
        this.parseAddress = function (path) {
            const result = new Address();
            // define root path (TODO: add 'root' config to app or remove 'root' from address)
            // define lang (TODO: add 'lang' config to app or remove 'lang' from address)
            // define realm
            for (const one of registry) {
                if (path.startsWith(`/${one}`)) {
                    result.realm = one;
                    path = path.replace(`/${one}`, '');
                    break; // one only realm is allowed in URL
                }
            }
            // define area
            if (path.startsWith(`/${DEF.AREA_API}`)) {
                result.area = DEF.AREA_API;
            } else if (path.startsWith(`/${DEF.AREA_SRC}`)) {
                result.area = DEF.AREA_SRC;
            } else if (path.startsWith(`/${DEF.AREA_WEB}`)) {
                result.area = DEF.AREA_WEB;
            }
            if (result.area !== undefined) {
                path = path.replace(`/${result.area}`, '');
            }
            result.route = path;
            return result;
        };

        // MAIN FUNCTIONALITY
        /** @type {TeqFw_Core_App_Plugin_Scan_Item[]} */
        const items = regPlugins.items();
        for (const item of items) {
            const realms = item?.teqfw?.http2?.realms;
            if (Array.isArray(realms)) {
                const allied = registry.concat(realms);
                registry = [...new Set(allied)];
            }
        }
    }
}

// MODULE'S EXPORT
export {
    TeqFw_Http2_Back_Model_Realm_Registry as default,
    Address,
};
