import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * HEMA rechargeable LED tealights device
 * Manufacturer: Taizhou Sparkle Lights Co., Ltd - BAT-LEDS01
 */
module.exports = class TealightHemaDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for HEMA tealights
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.HEMA;
  }

};
