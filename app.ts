'use strict';

import Homey from 'homey';

module.exports = class CandleLightApp extends Homey.App {

  async onInit() {
    this.log('✨', this.homey.__('app.initialized'));

    const allCandlesCard = this.homey.flow.getActionCard('all_candles');
    allCandlesCard.registerRunListener(async (args) => {
      const state = args.state === 'on' ? 'on' : 'off';
      const capabilityId = state === 'on' ? 'button.on' : 'button.off';
      const driverIds = [
        'hema-tealight',
        'deluxe-homeart',
        'lumiz-lantern',
        'action-3-button',
        'action-8-button',
        'action-10-button',
      ];

      for (const driverId of driverIds) {
        const driver = this.homey.drivers.getDriver(driverId);
        if (!driver) {
          this.log(`[${this.constructor.name}] Driver not found: ${driverId}`);
          continue;
        }

        const devices = driver.getDevices();
        for (const device of devices) {
          try {
            await device.triggerCapabilityListener(capabilityId, true);
          } catch (error) {
            this.error(`[${this.constructor.name}] Failed to set ${capabilityId} for ${device.getName()}`, error);
          }
        }
      }

      return true;
    });
  }

}
