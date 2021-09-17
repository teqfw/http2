/**
 * Stop HTTP/2 server.
 * @namespace TeqFw_Http2_Back_Cli_Server_Stop
 */
// MODULE'S IMPORT
import process from 'process';
import {join} from 'path';
import {readFileSync} from 'fs';

// DEFINE WORKING VARS
const NS = 'TeqFw_Http2_Back_Cli_Server_Stop';

// DEFINE MODULE'S FUNCTIONS
/**
 * Factory to create CLI command.
 *
 * @param {TeqFw_Di_Shared_SpecProxy} spec
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @constructor
 * @memberOf TeqFw_Http2_Back_Cli_Server_Stop
 */
export default function Factory(spec) {
    // EXTRACT DEPS
    /** @type {TeqFw_Http2_Back_Defaults} */
    const DEF = spec['TeqFw_Http2_Back_Defaults$'];
    /** @type {TeqFw_Core_Back_Config} */
    const config = spec['TeqFw_Core_Back_Config$'];
    /** @type {TeqFw_Core_Back_Api_Dto_Command.Factory} */
    const fCommand = spec['TeqFw_Core_Back_Api_Dto_Command#Factory$'];

    // DEFINE INNER FUNCTIONS
    /**
     * Stop the HTTP/2 server.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Http2_Back_Cli_Server_Stop
     */
    const action = async function () {
        try {
            const pidPath = join(config.getBoot().projectRoot, DEF.DATA_FILE_PID);
            const data = readFileSync(pidPath);
            // noinspection JSCheckFunctionSignatures
            const pid = Number.parseInt(data);
            console.info(`Stop web server (PID: ${pid}).`);
            process.kill(pid, 'SIGINT');
        } catch (e) {
            console.error('Cannot kill web server process.');
        }
    };
    Object.defineProperty(action, 'name', {value: `${NS}.${action.name}`});

    // COMPOSE RESULT
    const res = fCommand.create();
    res.realm = DEF.CLI_PREFIX;
    res.name = 'server-stop';
    res.desc = 'Stop the HTTP/2 server.';
    res.action = action;
    return res;
}

// finalize code components for this es6-module
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.name}`});
