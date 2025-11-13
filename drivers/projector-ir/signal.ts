import { RFSignal } from 'homey-rfdriver';

class GalaxySignal extends RFSignal {
  static FREQUENCY = 'ir';
  static ID = 'nec';
}

module.exports = GalaxySignal;