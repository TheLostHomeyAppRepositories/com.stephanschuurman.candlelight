import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Action - 10 Button Remote device
 */
module.exports = class ActionTenButtonDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Action 10-button remote
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.ACTION_10_BUTTON;
  }

  /**
   * Register extra capabilities for mode and dim controls
   */
  async onInit() {
    await super.onInit();

    await this.migrateActionCapabilities();

    this.registerCapabilityListener('button.mode_candle',
      (value: boolean, opts: any) => this.onCapabilityMode(value, opts, 'MODE_CANDLE'));
    this.registerCapabilityListener('button.mode_light',
      (value: boolean, opts: any) => this.onCapabilityMode(value, opts, 'MODE_LIGHT'));
    this.registerCapabilityListener('button.dim_down',
      (value: boolean, opts: any) => this.onCapabilityDim(value, opts, 'DIM_DOWN'));
    this.registerCapabilityListener('button.dim_up',
      (value: boolean, opts: any) => this.onCapabilityDim(value, opts, 'DIM_UP'));
  }

  /**
   * Migrate legacy mode/dim capabilities for existing devices
   */
  private async migrateActionCapabilities(): Promise<void> {
    try {
      if (this.hasCapability('mode')) {
        await this.removeCapability('mode');
      }

      const modeButtons = ['button.mode_candle', 'button.mode_light'];
      for (const capabilityId of modeButtons) {
        if (!this.hasCapability(capabilityId)) {
          await this.addCapability(capabilityId);
        }
      }

      const legacyDims = ['volume_down', 'volume_up'];
      for (const capabilityId of legacyDims) {
        if (this.hasCapability(capabilityId)) {
          await this.removeCapability(capabilityId);
        }
      }

      if (this.hasCapability('dim_direction')) {
        await this.removeCapability('dim_direction');
      }

      const channelButtons = ['channel_down', 'channel_up'];
      for (const capabilityId of channelButtons) {
        if (this.hasCapability(capabilityId)) {
          await this.removeCapability(capabilityId);
        }
      }

      const dimButtons = ['button.dim_down', 'button.dim_up'];
      for (const capabilityId of dimButtons) {
        if (!this.hasCapability(capabilityId)) {
          await this.addCapability(capabilityId);
        }
      }
    } catch (error) {
      this.error(`[${this.constructor.name}] Capability migration failed`, error);
    }
  }

  /**
   * Handle mode capabilities
   */
  private async onCapabilityMode(
    value: boolean,
    opts: any,
    commandKey: 'MODE_CANDLE' | 'MODE_LIGHT',
  ): Promise<void> {
    this.log(`[${this.constructor.name}] Mode button pressed:`, commandKey);

    const commands = this.getCommands();
    const commandCode = commands[commandKey];
    if (commandCode === undefined) {
      this.log(`[${this.constructor.name}] No command defined for mode:`, commandKey);
      return;
    }

    await this.ir.sendCommandRawQueued(commandCode);
  }

  /**
   * Handle dim capabilities
   */
  private async onCapabilityDim(
    value: boolean,
    opts: any,
    commandKey: 'DIM_DOWN' | 'DIM_UP',
  ): Promise<void> {
    this.log(`[${this.constructor.name}] Dim button pressed:`, commandKey);

    const commands = this.getCommands();
    const commandCode = commands[commandKey];
    if (commandCode === undefined) {
      this.log(`[${this.constructor.name}] No command defined for dim:`, commandKey);
      return;
    }

    await this.ir.sendCommandRawQueued(commandCode);
  }

};
