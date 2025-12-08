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

    // Register capability listeners
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
  }

  /**
   * Handle the OFF capability
   */
  async onCapabilityOff(value: boolean, opts: any): Promise<void> {
    this.log(`[${this.constructor.name}] onCapabilityOff`);
    const commands = this.getCommands();
    await this.ir.sendCommandRawQueued(commands.OFF);
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

}
