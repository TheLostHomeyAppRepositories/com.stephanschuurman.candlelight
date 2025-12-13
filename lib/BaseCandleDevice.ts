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
    this.log(`[${this.constructor.name}] (using BaseCandleDevice) has been initialized`);

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
      // Make sure legacy devices get the on/off quick action toggle
      if (!this.hasCapability('onoff')) {
        await this.addCapability('onoff');
      }

      const onOffOptions = await this.getCapabilityOptions('onoff') || {};
      if (onOffOptions.uiQuickAction !== true) {
        await this.setCapabilityOptions('onoff', { ...onOffOptions, uiQuickAction: true });
      }

      // Update labels for the momentary buttons so they no longer show "Knop in app"
      const buttonTitles: Record<string, { en: string; nl: string; fr: string; de: string }> = {
        'button.on': { en: 'On', nl: 'Aan', fr: 'Allumer', de: 'An' },
        'button.off': { en: 'Off', nl: 'Uit', fr: 'Éteindre', de: 'Aus' },
        'button.2h': { en: 'Timer 2 hours', nl: 'Timer 2 uur', fr: 'Minuteur 2 heures', de: 'Timer 2 Stunden' },
        'button.4h': { en: 'Timer 4 hours', nl: 'Timer 4 uur', fr: 'Minuteur 4 heures', de: 'Timer 4 Stunden' },
        'button.6h': { en: 'Timer 6 hours', nl: 'Timer 6 uur', fr: 'Minuteur 6 heures', de: 'Timer 6 Stunden' },
        'button.8h': { en: 'Timer 8 hours', nl: 'Timer 8 uur', fr: 'Minuteur 8 heures', de: 'Timer 8 Stunden' },
      };

      for (const [capabilityId, title] of Object.entries(buttonTitles)) {
        if (!this.hasCapability(capabilityId)) continue;

        const currentOptions = await this.getCapabilityOptions(capabilityId) || {};
        const currentTitle = JSON.stringify(currentOptions.title);
        const desiredTitle = JSON.stringify(title);

        if (currentTitle !== desiredTitle) {
          await this.setCapabilityOptions(capabilityId, { ...currentOptions, title });
        }
      }

    } catch (error) {
      this.error(`[${this.constructor.name}] Capability migration failed`, error);
    }
  }

}
