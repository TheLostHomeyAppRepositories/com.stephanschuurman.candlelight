import Homey from 'homey';

module.exports = class ActionTenButtonDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log(`[${this.constructor.name}] has been initialized`);

    // Register flow card actions
    this.homey.flow.getActionCard('action-10-button_on')
      .registerRunListener(async (args) => {
        const { device } = args;
        this.log(`[${this.constructor.name}] On flow action triggered`);
        await device.triggerCapabilityListener('button.on', true);
      });

    this.homey.flow.getActionCard('action-10-button_off')
      .registerRunListener(async (args) => {
        const { device } = args;
        this.log(`[${this.constructor.name}] Off flow action triggered`);
        await device.triggerCapabilityListener('button.off', true);
      });

    this.homey.flow.getActionCard('action-10-button_timer')
      .registerRunListener(async (args) => {
        const { device, timer_cmd } = args;
        this.log(`[${this.constructor.name}] Timer flow action triggered: ${timer_cmd}`);
        await device.triggerCapabilityListener(`button.${timer_cmd}`, true);
      });

    this.homey.flow.getActionCard('action-10-button_mode')
      .registerRunListener(async (args) => {
        const { device, mode_cmd } = args;
        this.log(`[${this.constructor.name}] Mode flow action triggered: ${mode_cmd}`);
        await device.triggerCapabilityListener(`button.${mode_cmd}`, true);
      });

    this.homey.flow.getActionCard('action-10-button_dim')
      .registerRunListener(async (args) => {
        const { device, dim_cmd } = args;
        this.log(`[${this.constructor.name}] Dim flow action triggered: ${dim_cmd}`);
        await device.triggerCapabilityListener(`button.${dim_cmd}`, true);
      });

  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    this.log('Pairing: listing devices');

    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

};
