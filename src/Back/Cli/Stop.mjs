/**
 * Stop HTTP/2 server.
 * @namespace TeqFw_Http2_Back_Cli_Stop
 */
// MODULE'S IMPORT
import $path from 'path';
import $fs from 'fs';

// DEFINE WORKING VARS
const NS = 'TeqFw_Http2_Back_Cli_Stop';

// DEFINE MODULE'S FUNCTIONS
/**
 * Factory to create CLI command.
 *
 * @param {TeqFw_Di_SpecProxy} spec
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @constructor
 * @memberOf TeqFw_Http2_Back_Cli_Stop
 */
function Factory(spec) {
    // EXTRACT DEPS
    /** @type {TeqFw_Http2_Defaults} */
    const DEF = spec['TeqFw_Http2_Defaults$'];   // singleton
    /** @type {TeqFw_Core_Back_App.Bootstrap} */
    const cfg = spec['TeqFw_Core_Back_App#Bootstrap$']; // singleton
    /** @type {Function|TeqFw_Core_Back_Api_Dto_Command.Factory} */
    const fCommand = spec['TeqFw_Core_Back_Api_Dto_Command#Factory$']; // singleton

    // DEFINE INNER FUNCTIONS
    /**
     * Stop the HTTP/2 server.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Http2_Back_Cli_Stop
     */
    const action = async function () {
        try {
            const pidPath = $path.join(cfg.root, DEF.PID_FILE_NAME);
            const data = $fs.readFileSync(pidPath);
            const pid = data.toString();
            console.info(`Stop web server (PID: ${pid}).`);
            process.kill(pid, 'SIGINT');
        } catch (e) {
            console.error('Cannot kill web server process.');
        }
    };
    Object.defineProperty(action, 'name', {value: `${NS}.${action.name}`});

    // COMPOSE RESULT
    const res = fCommand.create();
    res.ns = DEF.BACK_REALM;
    res.name = 'stop';
    res.desc = 'Stop the HTTP/2 server.';
    res.action = action;
    return res;
}

// MODULE'S EXPORT
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
export default Factory;
