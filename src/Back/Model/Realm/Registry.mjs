/**
 * Registry for HTTP/2 server frontend areas ('pub' or 'admin').
 *
 * @namespace TeqFw_Http2_Back_Model_Realm_Registry
 */
// MODULE'S VARS
const NS = 'TeqFw_Http2_Back_Model_Realm_Registry';

// MODULE'S CLASSES
/**
 * Structure to represent address (URL).
 * General form: https://hostname.com/root/lang/area/zone/route/to/resource
 * @memberOf TeqFw_Http2_Back_Model_Realm_Registry
 * @deprecated
 */
class Address {
    /** @type {string} frontend door ('admin' or 'pub') */
    door;
    /** @type {string} language code (TODO: reserved) */
    lang;
    /** @type {string} root folder (TODO: reserved) */
    root;
    /** @type {string} route to the resource (static or service) */
    route;
    /** @type {string} HTTP2 handlers zone ('api', 'src' or 'web') */
    zone;
}

/**
 * Registry for HTTP/2 server areas.
 * @deprecated
 */
class TeqFw_Http2_Back_Model_Realm_Registry {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Http2_Defaults} */
        const DEF = spec['TeqFw_Http2_Defaults$']; // singleton
        /** @type {TeqFw_Core_Back_Scan_Plugin_Registry} */
        const regPlugins = spec['TeqFw_Core_Back_Scan_Plugin_Registry$'];   // singleton
        /** @type {String[]} internal store for areas */
        let registry = [];

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
            // define area (pub, admin)
            for (const one of registry) {
                if (path.startsWith(`/${one}`)) {
                    result.door = one;
                    path = path.replace(`/${one}`, '');
                    break; // one only realm is allowed in URL
                }
            }
            // define zone
            if (path.startsWith(`/${DEF.ZONE_API}`)) {
                result.zone = DEF.ZONE_API;
            } else if (path.startsWith(`/${DEF.ZONE_SRC}`)) {
                result.zone = DEF.ZONE_SRC;
            } else if (path.startsWith(`/${DEF.ZONE_WEB}`)) {
                result.zone = DEF.ZONE_WEB;
            }
            if (result.zone !== undefined) {
                // remove area from the path
                path = path.replace(`/${result.zone}`, '');
            }
            result.route = path;
            return result;
        };

        // MAIN FUNCTIONALITY
        /** @type {TeqFw_Core_Back_Scan_Plugin_Item[]} */
        const items = regPlugins.items();
        for (const item of items) {
            const areas = item?.teqfw?.http2?.areas;
            if (Array.isArray(areas)) {
                const allied = registry.concat(areas);
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
