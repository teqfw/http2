/**
 * @namespace TeqFw_Http2_Cli_Start
 */
// MODULE'S IMPORT
import $path from 'path';
import $fs from 'fs';

// DEFINE WORKING VARS
const NS = 'TeqFw_Http2_Cli_Start';

// DEFINE MODULE'S FUNCTIONS
/**
 * Factory to create CLI command to start HTTP2 server.
 *
 * @param {TeqFw_Di_SpecProxy} spec
 * @returns {TeqFw_Core_App_Cli_Command_Data}
 * @constructor
 * @memberOf TeqFw_Http2_Cli_Start
 */
function Factory(spec) {
    // PARSE INPUT & DEFINE WORKING VARS
    /** @type {TeqFw_Http2_Defaults} */
    const DEF = spec['TeqFw_Http2_Defaults$'];   // instance singleton
    /** @type {TeqFw_Core_App_Launcher.Bootstrap} */
    const bootCfg = spec[DEF.MOD_CORE.DI_BOOTSTRAP]; // named singleton
    /** @type {TeqFw_Di_Container} */
    const container = spec[DEF.MOD_CORE.DI_CONTAINER];  // instance singleton
    /** @type {TeqFw_Core_App_Config} */
    const config = spec['TeqFw_Core_App_Config$'];  // instance singleton
    /** @type {TeqFw_Core_App_Logger} */
    const logger = spec['TeqFw_Core_App_Logger$'];  // instance singleton
    /** @type {typeof TeqFw_Core_App_Cli_Command_Data} */
    const Command = spec['TeqFw_Core_App_Cli_Command#Data'];    // class

    // DEFINE INNER FUNCTIONS
    /**
     * Start the HTTP/2 server.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Http2_Cli_Start
     */
    const action = async function () {
        logger.info('Starting HTTP/2 server.');
        /** @type {TeqFw_Http2_Back_Server} */
        const server = await container.get('TeqFw_Http2_Back_Server$', NS);
        await server.init();

        // collect startup configuration then compose path to PID file
        const portCfg = config.get('local/server/port');
        const port = portCfg || DEF.SERVER_DEFAULT_PORT;
        const pid = process.pid.toString();
        const pidPath = $path.join(bootCfg.root, DEF.PID_FILE_NAME);
        // write PID to file then start the server
        try {
            $fs.writeFileSync(pidPath, pid);
            // PID is wrote => start the server
            await server.listen(port);
            logger.info(`HTTP/2 server is listening on port ${port}. PID: ${pid}.`);
        } catch (e) {
            console.error('%s', e);
        }
    };

    // MAIN FUNCTIONALITY
    Object.defineProperty(action, 'name', {value: `${NS}.${action.name}`});

    // COMPOSE RESULT
    const result = new Command();
    result.ns = DEF.BACK_REALM;
    result.name = 'start';
    result.desc = 'Start the HTTP/2 server.';
    result.action = action;
    return result;
}

// MODULE'S FUNCTIONALITY
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.name}`});

// MODULE'S EXPORT
export default Factory;
