import { RFSignal } from 'homey-rfdriver';

class GalaxyProntoSignal extends RFSignal {
  static FREQUENCY = 'ir';
  static ID = 'nec-pronto';
}

module.exports = GalaxyProntoSignal;