/**
 * @namespace TeqFw_Http2_Back_Cli_Stop
 */
// MODULE'S IMPORT
import $path from 'path';
import $fs from 'fs';

// DEFINE WORKING VARS
const NS = 'TeqFw_Http2_Back_Cli_Stop';

// DEFINE MODULE'S FUNCTIONS
/**
 * Factory to create CLI command to stop HTTP2 server.
 *
 * @param {TeqFw_Di_SpecProxy} spec
 * @returns {TeqFw_Core_Back_Cli_Command_Data}
 * @constructor
 * @memberOf TeqFw_Http2_Back_Cli_Stop
 */
function Factory(spec) {
    // PARSE INPUT & DEFINE WORKING VARS
    /** @type {TeqFw_Http2_Defaults} */
    const DEF = spec['TeqFw_Http2_Defaults$'];   // singleton
    /** @type {TeqFw_Core_Back_App.Bootstrap} */
    const bootCfg = spec[DEF.MOD_CORE.DI_BOOTSTRAP]; // singleton
    /** @type {typeof TeqFw_Core_Back_Cli_Command_Data} */
    const Command = spec['TeqFw_Core_Back_Cli_Command#Data'];    // class

    // DEFINE INNER FUNCTIONS
    /**
     * Stop the HTTP/2 server.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Http2_Back_Cli_Stop
     */
    const action = async function () {
        try {
            const pidPath = $path.join(bootCfg.root, DEF.PID_FILE_NAME);
            const data = $fs.readFileSync(pidPath);
            const pid = data.toString();
            console.info(`Stop web server (PID: ${pid}).`);
            process.kill(pid, 'SIGINT');
        } catch (e) {
            console.error('Cannot kill web server process.');
        }
    };

    // MAIN FUNCTIONALITY
    Object.defineProperty(action, 'name', {value: `${NS}.${action.name}`});

    // COMPOSE RESULT
    const result = new Command();
    result.ns = DEF.BACK_REALM;
    result.name = 'stop';
    result.desc = 'Stop the HTTP/2 server.';
    result.action = action;
    return result;
}

// MODULE'S FUNCTIONALITY
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

// MODULE'S EXPORT
export default Factory;
