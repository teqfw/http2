import $path from 'path';
import $fs from 'fs';

/**
 * Factory class to create CLI command to stop HTTP2 server.
 */
export default class TeqFw_Http2_Cli_Stop {

    constructor(spec) {
        // CONSTRUCTOR INJECTED DEPS
        /** @type {TeqFw_Http2_Defaults} */
        const DEF = spec['TeqFw_Http2_Defaults$'];   // instance singleton
        /** @type {TeqFw_Core_App_Launcher.Bootstrap} */
        const bootCfg = spec[DEF.MOD_CORE.DI_BOOTSTRAP]; // named singleton
        /** @type {typeof TeqFw_Core_App_Cli_Command_Data} */
        const Command = spec['TeqFw_Core_App_Cli_Command#Data'];    // class constructor

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)

        /**
         * @see TeqFw_Core_App_Cli_Command.create
         * @returns {Promise<TeqFw_Core_App_Cli_Command>}
         */
        this.create = async function () {
            // this is sample code:
            const result = new Command();
            result.ns = DEF.BACK_REALM;
            result.name = 'stop';
            result.desc = 'Stop the HTTP/2 server.';
            result.action = async function () {
                try {
                    const pidPath = $path.join(bootCfg.root, DEF.PID_FILE_NAME);
                    const data = $fs.readFileSync(pidPath);
                    const pid = data.toString();
                    console.info(`Stop web server (PID: ${pid}).`);
                    process.kill(pid, 'SIGINT');
                } catch (e) {
                    console.error('Cannot kill API server process.');
                }
            };
            return result;
        };
    }
}
