import $path from 'path';
import $fs from 'fs';

/**
 * Factory class to create CLI command to start HTTP2 server.
 */
export default class TeqFw_Http2_Cli_Start {

    constructor(spec) {
        // CONSTRUCTOR INJECTED DEPS
        /** @type {TeqFw_Http2_Defaults} */
        const DEF = spec['TeqFw_Http2_Defaults$'];   // instance singleton
        /** @type {TeqFw_Core_App_Launcher.Bootstrap} */
        const bootCfg = spec[DEF.MOD_CORE.DI_BOOTSTRAP]; // named singleton
        /** @type {TeqFw_Di_Container} */
        const container = spec['TeqFw_Di_Container$'];  // instance singleton
        /** @type {TeqFw_Core_App_Config} */
        const config = spec['TeqFw_Core_App_Config$'];  // instance singleton
        /** @type {TeqFw_Core_App_Logger} */
        const logger = spec['TeqFw_Core_App_Logger$'];  // instance singleton
        /** @type {typeof TeqFw_Core_App_Cli_Command_Data} */
        const Command = spec['TeqFw_Core_App_Cli_Command#Data'];    // class constructor

        // RUNTIME INJECTED DEPS
        /**  @returns {Promise<TeqFw_Http2_Back_Server>} */
        const getServer = async () => await container.get('TeqFw_Http2_Back_Server$', this.constructor.name);

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)

        /**
         * @see TeqFw_Core_App_Cli_Command.create
         * @returns {Promise<TeqFw_Core_App_Cli_Command>}
         */
        this.create = async function () {
            // this is sample code:
            const result = new Command();
            result.ns = DEF.BACK_REALM;
            result.name = 'start';
            result.desc = 'Start the HTTP/2 server.';
            result.action = async function () {
                logger.info(result.desc);
                const server = await getServer();
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
                    logger.info(`HTTP2 server is listening on port ${port}. PID: ${pid}.`);
                } catch (e) {
                    console.error('%s', e);
                }

            };
            return result;
        };
    }
}
