import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Deluxe Homeart - Real Flame LED Candle device
 */
module.exports = class DeluxeHomeartDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Deluxe Homeart candles
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.DELUXE;
  }

};
