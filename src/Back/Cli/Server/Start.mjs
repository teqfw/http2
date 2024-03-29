/**
 * Start HTTP/2 server to process web requests.
 * @namespace TeqFw_Http2_Back_Cli_Server_Start
 */
// MODULE'S IMPORT
import {join} from 'path';
import {existsSync, mkdirSync, writeFileSync} from 'fs';

// DEFINE WORKING VARS
const NS = 'TeqFw_Http2_Back_Cli_Server_Start';
const OPT_PORT = 'port';

// DEFINE MODULE'S FUNCTIONS
/**
 * Factory to create CLI command.
 *
 * @param {TeqFw_Di_Shared_SpecProxy} spec
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @memberOf TeqFw_Http2_Back_Cli_Server_Start
 */
export default function Factory(spec) {
    // EXTRACT DEPS
    /** @type {TeqFw_Http2_Back_Defaults} */
    const DEF = spec['TeqFw_Http2_Back_Defaults$'];
    /** @type {TeqFw_Di_Shared_Container} */
    const container = spec['TeqFw_Di_Shared_Container$'];
    /** @type {TeqFw_Core_Back_Config} */
    const config = spec['TeqFw_Core_Back_Config$'];
    /** @type {TeqFw_Core_Shared_Logger} */
    const logger = spec['TeqFw_Core_Shared_Logger$'];
    /** @type {TeqFw_Core_Back_Api_Dto_Command.Factory} */
    const fCommand = spec['TeqFw_Core_Back_Api_Dto_Command#Factory$'];
    /** @type {TeqFw_Core_Back_Api_Dto_Command_Option.Factory} */
    const fOpt = spec['TeqFw_Core_Back_Api_Dto_Command_Option#Factory$'];

    // DEFINE INNER FUNCTIONS
    /**
     * Start the HTTP/2 server.
     *
     * @param {Object} opts command options
     * @returns {Promise<void>}
     * @memberOf TeqFw_Http2_Back_Cli_Server_Start
     */
    const action = async function (opts) {
        logger.pause(false);
        logger.info('Starting HTTP/2 server.');
        try {
            /**
             * TODO: We have no lazy loading for DI yet, so we need to use Container directly
             * TODO: to prevent all deps loading.
             */
            /** @type {TeqFw_Http2_Back_Server} */
            const server = await container.get('TeqFw_Http2_Back_Server$', NS);
            await server.init();

            // collect startup configuration then compose path to PID file
            // port from command option
            const portOpt = opts[OPT_PORT];
            // port from local configuration
            /** @type {TeqFw_Web_Back_Dto_Config_Local} */
            const cfgLocal = config.getLocal(DEF.MOD_WEB.SHARED.NAME);
            const portCfg = cfgLocal?.server?.port;
            // use port: command opt / local cfg / default
            const port = portOpt || portCfg || DEF.MOD_WEB.DATA_SERVER_PORT;
            const pid = process.pid.toString();

            // write PID to file then start the server
            const pidPath = join(config.getBoot().projectRoot, DEF.DATA_FILE_PID);
            const pidDir = pidPath.substring(0, pidPath.lastIndexOf('/'));
            if (!existsSync(pidDir)) mkdirSync(pidDir);
            writeFileSync(pidPath, pid);
            // PID is wrote => start the server
            await server.listen(port);
            logger.info(`HTTP/2 server is listening on port ${port}. PID: ${pid}.`);
        } catch (e) {
            console.error('%s', e);
        }
    };
    Object.defineProperty(action, 'name', {value: `${NS}.${action.name}`});

    // COMPOSE RESULT
    const res = fCommand.create();
    res.realm = DEF.CLI_PREFIX;
    res.name = 'server-start';
    res.desc = 'Start the HTTP/2 server.';
    res.action = action;
    // add option --port
    const optShort = fOpt.create();
    optShort.flags = `-p, --${OPT_PORT} <port>`;
    optShort.description = `port to use (default: ${DEF.MOD_WEB.DATA_SERVER_PORT})`;
    res.opts.push(optShort);
    return res;
}

// finalize code components for this es6-module
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.name}`});
