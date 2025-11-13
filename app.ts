'use strict';

import Homey from 'homey';

module.exports = class AstroApp extends Homey.App {

  async onInit() {
    this.log('✨', this.homey.__('app.initialized'));
  }

}
