declare module 'homey-rfdriver' {
  import Homey from 'homey';

  export class RFDevice extends Homey.Device {
    // Add any known methods/properties here if needed
  }

  export class RFSignal {
    // Add any known methods/properties here if needed
    cmd(command: string, options?: any): Promise<void>;
    tx(frameData: number[], options?: any): Promise<void>;
  }

  export class RFDriver extends Homey.Driver {
    // Add any known methods/properties here if needed
  }
}
