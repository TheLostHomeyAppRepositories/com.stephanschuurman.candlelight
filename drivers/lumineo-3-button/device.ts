import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Lumineo - 3 Button Remote device
 */
module.exports = class LumineoThreeButtonDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Lumineo 3-button remote
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.LUMINEO_3_BUTTON;
  }

};
