/**
 * Utilities related to HTTP2 server.
 * @namespace TeqFw_Http2_Back_Util
 */

/**
 * Compose expired HTTP cookie to remove existing cookie with the same name in the browser.
 *
 * @param {String} name
 * @param {String} realm
 * @returns {String}
 * @memberOf TeqFw_Http2_Back_Util
 */
function cookieClear({name, realm = ''}) {
    // MAIN FUNCTIONALITY
    const exp = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const path = `Path=/${realm}`;
    return `${name}=; ${exp}; ${path}`;
}

/**
 * Construct string for 'Set-Cookie' HTTP header.
 *
 * @param {String} name
 * @param {String} value
 * @param {String} path
 * @param {Date|number|String} expires 'Expires=' for Date & String, 'Max-Age=' for integer number
 * @param {String} domain
 * @param {Boolean} secure
 * @param {Boolean} httpOnly
 * @param {String} sameSite [Lax | Strict | None] @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
 * @returns {String}
 * @memberOf TeqFw_Http2_Back_Util
 */
function cookieCreate({name, value, path, expires, domain, secure, httpOnly, sameSite}) {
    let result = `${name}=${value};`;
    if (expires) {
        if (expires instanceof Date) {
            result = `${result} Expires=${expires.toUTCString()};`;
        } else if (Number.isInteger(expires)) {
            result = `${result} Max-Age=${expires};`;
        } else if (typeof expires === 'string') {
            result = `${result} Expires=${expires};`;
        }
    }
    if (domain) result = `${result} Domain=${domain};`;
    if (path) result = `${result} Path=${path};`;
    if (secure !== false) result = `${result} Secure;`; // always secure except implicit notation
    if (httpOnly !== false) result = `${result} HttpOnly;`; // always http only except implicit notation
    if (sameSite) {
        result = `${result} SameSite=${sameSite};`;
    } else {
        result = `${result} SameSite=Strict;`;
    }
    return result;
}

export {
    cookieClear,
    cookieCreate
};
