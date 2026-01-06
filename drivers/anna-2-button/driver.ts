import Homey from 'homey';

module.exports = class AnnaTwoButtonDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log(`[${this.constructor.name}] has been initialized`);

    // Register flow card actions
    this.homey.flow.getActionCard('anna-2-button_on')
      .registerRunListener(async (args) => {
        const { device } = args;
        this.log(`[${this.constructor.name}] On flow action triggered`);
        await device.triggerCapabilityListener('button.on', true);
      });

    this.homey.flow.getActionCard('anna-2-button_off')
      .registerRunListener(async (args) => {
        const { device } = args;
        this.log(`[${this.constructor.name}] Off flow action triggered`);
        await device.triggerCapabilityListener('button.off', true);
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
