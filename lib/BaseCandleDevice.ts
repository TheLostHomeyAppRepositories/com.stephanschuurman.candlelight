import Homey from 'homey';
import Infrared from './ir';
import { CommandSet, TimerDuration } from './ir-commands';

/**
 * Base class for all LED candle devices
 * Provides shared functionality and abstract methods for device-specific IR commands
 */
export abstract class BaseCandleDevice extends Homey.Device {

  ir!: Infrared;

  /**
   * Get the IR command set for this specific device
   * Must be implemented by child classes
   */
  protected abstract getCommands(): CommandSet;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log(`[${this.constructor.name}] has been initialized`);

    // Ensure legacy devices get the new onoff capability and correct quick-action options
    await this.migrateCapabilities();

    // Register capability listeners
    this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
    this.registerCapabilityListener('button.on', this.onCapabilityOn.bind(this));
    this.registerCapabilityListener('button.off', this.onCapabilityOff.bind(this));

    // Register timer capability listeners
    const timers: TimerDuration[] = ['2h', '4h', '6h', '8h'];
    timers.forEach(timer => {
      this.registerCapabilityListener(`button.${timer}`, 
        (value: boolean, opts: any) => this.onCapabilityTimer(value, opts, timer)
      );
    });

    // Init IR API
    this.ir = new Infrared(this);
    await this.ir.init();
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log(`[${this.constructor.name}] has been added`);
  }

  /**
   * onSettings is called when the user updates the device's settings.
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log(`[${this.constructor.name}] settings where changed`);
    this.log('Changed keys:', changedKeys);
  }

  /**
   * onRenamed is called when the user updates the device's name.
   */
  async onRenamed(name: string) {
    this.log(`[${this.constructor.name}] was renamed to: ${name}`);
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log(`[${this.constructor.name}] has been deleted`);
  }

  /**
   * Handle the ON capability
   */
  async onCapabilityOn(value: boolean, opts: any): Promise<void> {
    this.log(`[${this.constructor.name}] onCapabilityOn`);
    const commands = this.getCommands();
    await this.ir.sendCommandRawQueued(commands.ON);
    await this.updateOnOffState(true);
  }

  /**
   * Handle the OFF capability
   */
  async onCapabilityOff(value: boolean, opts: any): Promise<void> {
    this.log(`[${this.constructor.name}] onCapabilityOff`);
    const commands = this.getCommands();
    await this.ir.sendCommandRawQueued(commands.OFF);
    await this.updateOnOffState(false);
  }

  /**
   * Handle the onoff capability for quick actions
   */
  async onCapabilityOnOff(value: boolean, opts: any): Promise<void> {
    this.log(`[${this.constructor.name}] onCapabilityOnOff -> ${value ? 'ON' : 'OFF'}`);
    const commands = this.getCommands();
    const commandCode = value ? commands.ON : commands.OFF;
    await this.ir.sendCommandRawQueued(commandCode);
    await this.updateOnOffState(value);
  }

  /**
   * Handle timer capability
   */
  async onCapabilityTimer(value: boolean, opts: any, timer: TimerDuration): Promise<void> {
    this.log(`[${this.constructor.name}] Timer button pressed:`, timer);
    
    const commands = this.getCommands();
    const timerKey = `TIMER_${timer.toUpperCase()}` as keyof CommandSet;
    const commandCode = commands[timerKey];

    if (commandCode === undefined) {
      this.log(`[${this.constructor.name}] No command defined for timer:`, timer);
      return;
    }

    if (this.getSetting('send_on_before_timer')) {
      await this.ir.sendCommandRawQueued(commands.ON);
    }
    await this.ir.sendCommandRawQueued(commandCode);
  }

  /**
   * Keep the onoff capability in sync when available
   */
  private async updateOnOffState(value: boolean): Promise<void> {
    if (!this.hasCapability('onoff')) return;

    try {
      await this.setCapabilityValue('onoff', value);
    } catch (error) {
      this.error(`[${this.constructor.name}] Failed to update onoff state`, error);
    }
  }

  /**
   * Add new capabilities/options for already-paired devices
   */
  private async migrateCapabilities(): Promise<void> {
    try {
      if (!this.hasCapability('onoff')) {
        await this.addCapability('onoff');
        // Default to a known state to avoid undefined tiles
        await this.setCapabilityValue('onoff', false);
      }

      // Ensure tile quick action uses onoff, not the button capabilities
      if (this.hasCapability('onoff')) {
        await this.setCapabilityOptions('onoff', { uiQuickAction: true });
      }
      if (this.hasCapability('button.on')) {
        await this.setCapabilityOptions('button.on', { uiQuickAction: false });
      }
      if (this.hasCapability('button.off')) {
        await this.setCapabilityOptions('button.off', { uiQuickAction: false });
      }
    } catch (error) {
      this.error(`[${this.constructor.name}] Capability migration failed`, error);
    }
  }

}
