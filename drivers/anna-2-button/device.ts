import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Anna's Collection - 2 Button Remote device
 */
module.exports = class AnnaTwoButtonDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Anna's Collection 2-button remote
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.ANNA_2_BUTTON;
  }

};
