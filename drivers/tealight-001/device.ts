import Homey from 'homey';
import Infrared from '../../lib/ir';

module.exports = class MyDevice extends Homey.Device {

  ir!: Infrared;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyDevice has been initialized');

    // Register capability listeners
    this.registerCapabilityListener('on', this.onCapabilityOn.bind(this));
    this.registerCapabilityListener('off', this.onCapabilityOff.bind(this));
    this.registerCapabilityListener('2h', (value: boolean, opts: any) => this.onCapabilityTimer(value, opts, '2h'));
    this.registerCapabilityListener('4h', (value: boolean, opts: any) => this.onCapabilityTimer(value, opts, '4h'));
    this.registerCapabilityListener('6h', (value: boolean, opts: any) => this.onCapabilityTimer(value, opts, '6h'));
    this.registerCapabilityListener('8h', (value: boolean, opts: any) => this.onCapabilityTimer(value, opts, '8h'));

    // Init API
    this.ir = new Infrared(this);
    await this.ir.init();
    
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
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
    this.log("MyDevice settings where changed");
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

  async onCapabilityOn(value: boolean, opts: any): Promise<void> {
    this.log('[Device] onCapabilityOn called with value:', value);
    this.ir.sendCommandRaw(0x45);
  }

  async onCapabilityOff(value: boolean, opts: any): Promise<void> {
    this.log('[Device] onCapabilityOff called with value:', value);
    this.ir.sendCommandRaw(0x47);
  }

  async onCapabilityTimer(value: boolean, opts: any, timer: string): Promise<void> {
    this.log('[Device] Timer button pressed:', timer);
    switch (timer) {
      case '2h':
        // Handle 2-hour timer logic here
        this.ir.sendCommandRaw(0x44);
        break;
      case '4h':
        // Handle 4-hour timer logic here
        this.ir.sendCommandRaw(0x43);
        break;
      case '6h':
        // Handle 6-hour timer logic here
        this.ir.sendCommandRaw(0x07);
        break;
      case '8h':
        // Handle 8-hour timer logic here
        this.ir.sendCommandRaw(0x09);
        break;
      default:
        this.log('[Device] Unknown timer value:', timer);
    } 
  }

};
