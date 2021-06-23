/**
 * Base class to implement indicator for ajax requests (on/off). This is simple implementation of the functionality
 * and should be overridden on application level to interact with UI.
 * @interface
 */
export default class TeqFw_Http2_Front_Gate_Connect_AjaxLed {
    on() {
        console.log('Ajax LED On');
    }

    off() {
        console.log('Ajax LED Off');
    }
}
