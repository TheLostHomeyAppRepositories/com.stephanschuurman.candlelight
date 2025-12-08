import Homey from 'homey';
import { RFDevice } from 'homey-rfdriver'; // https://github.com/athombv/node-homey-rfdriver/
import { IRUtils } from './IRUtils';

/**
 * Device API class to centralize IR communication
 * Follows the Homey device API pattern
 */
class Infrared extends Homey.SimpleClass {

  private device: RFDevice;
  private signal: any;
  private prontoSignal: any;
  private lastCommandTime: number = 0;
  private readonly MIN_COMMAND_INTERVAL_MS: number = 250; // Minimum time in ms between commands
  private readonly MAX_QUEUE_SIZE: number = 5; // Maximum number of queued commands
  private commandQueue: Promise<any> = Promise.resolve(); // Queue to serialize commands
  private queueSize: number = 0; // Track current queue size

  constructor(device: RFDevice) {
    super();
    this.device = device;
  }

  /**
   * Initialize the API with the required IR signals
   */
  async init() {
    try {
      this.signal = this.device.homey.rf.getSignalInfrared('nec');
      this.prontoSignal = this.device.homey.rf.getSignalInfrared('nec-pronto');
      this.device.log('IR initialized');
    } catch (error) {
      this.device.error('Failed to initialize IR:', error);
      throw error;
    }
  }

  async sendCommandRaw(commandCode: number): Promise<boolean> {
    try {
      const frameData = IRUtils.necCommandToHomeyBits(commandCode);
      if (!frameData) {
        throw new Error(`Unknown command: ${commandCode}`);
      }
      
      // Get repetitions setting (default: 3)
      const repetitions = this.device.getSetting('ir_repetitions') || 3;
      
      this.signal.tx(frameData, { device: this.device, repetitions });
      // this.sendRawCommand(frameData, false);
      return true;

    } catch (error: any) {
      this.device.error(`Failed to send IR command ${commandCode}:`, error);

      // Emit error event
      this.emit('command-error', { command: commandCode, error: error.message });

      // Rate limiting handling
      if (error.message && error.message.includes('Too Many IR Commands')) {
        this.device.log('Rate limit exceeded, waiting before retry...');
        await this.sleep(100);
        return false;
      }

      throw error;
    }
  }

  /**
   * Versie van sendCommandRaw met queue en rate limit
   * Gebruikt dezelfde commandCode argument maar loopt via sendRawCommand()
   */
  async sendCommandRawQueued(commandCode: number): Promise<boolean> {
    const frameData = IRUtils.necCommandToHomeyBits(commandCode);
    if (!frameData) {
      const errorMsg = `Unknown IR command: 0x${commandCode.toString(16).toUpperCase()}`;
      this.device.error(errorMsg);
      
      // Create a notification visible in the Homey app
      try {
        await this.device.homey.notifications.createNotification({
          excerpt: errorMsg
        });
      } catch (err) {
        this.device.error('Failed to create notification:', err);
      }
      
      return false;
    }

    // Gebruik de bestaande queue + interval logica van sendRawCommand
    return this.sendRawCommand(frameData, false);
  }

  async sendCommand(command: string, longPress: boolean = false): Promise<boolean> {
    // Check queue size limit
    if (this.queueSize >= this.MAX_QUEUE_SIZE) {
      this.device.error(`Command queue full (${this.MAX_QUEUE_SIZE}), dropping command: ${command}`);
      return false;
    }

    // Voeg het commando toe aan de queue
    this.queueSize++;
    return new Promise((resolve, reject) => {
      this.commandQueue = this.commandQueue
        .then(() => this._sendCommandInternal(command, longPress))
        .then((result) => {
          this.queueSize--;
          resolve(result);
        })
        .catch((error) => {
          this.queueSize--;
          reject(error);
        });
    });
  }

  /**
   * Internal method that sends the actual IR command
   * Always called via the queue to enforce serialization
   */
  private async _sendCommandInternal(command: string, longPress: boolean = false): Promise<boolean> {
    try {
      // Rate limiting: wait if needed before sending next command
      const now = Date.now();
      const timeSinceLastCommand = now - this.lastCommandTime;

      if (timeSinceLastCommand < this.MIN_COMMAND_INTERVAL_MS) {
        const waitTime = this.MIN_COMMAND_INTERVAL_MS - timeSinceLastCommand;
        this.device.log(`⏱️ Rate limiting: waiting ${waitTime}ms before sending command`);
        await this.sleep(waitTime);
      }

      this.device.log(`📡 Sending IR command: ${command} (longPress: ${longPress})`);

      await this.signal.cmd(command, { device: this.device });

      // Update last command timestamp
      this.lastCommandTime = Date.now();

      // Send the frame
      //await this.signal.tx(frameData, { device: this.device });

      // For long press, send repeat
      if (longPress) {
        // Get repetitions setting (default: 3), min. 8 for long press
        const repetitions = Math.max(8, this.device.getSetting('ir_repetitions') || 3);
        
        await this.prontoSignal.cmd('Repeat', {
          repetitions,
          device: this.device
        });
        await this.sleep(200); // Short pause after long press
        this.lastCommandTime = Date.now(); // Update timestamp after long press
      }

      // Emit state change event
      this.emit('command-sent', { command, longPress, success: true });

      return true;

    } catch (error: any) {
      this.device.error(`Failed to send IR command ${command}:`, error);

      // Emit error event
      this.emit('command-error', { command, longPress, error: error.message });

      // Rate limiting handling
      if (error.message && error.message.includes('Too Many IR Commands')) {
        this.device.log('Rate limit exceeded, waiting before retry...');
        await this.sleep(1000);
        return false;
      }

      throw error;
    }
  }

  /**
   * Helper method to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Static method to test IR connectivity during pairing
   */
  static async testIRConnectivity(homey: any, device: any): Promise<boolean> {
    try {
      const signal = homey.rf.getSignalInfrared('nec');
      await signal.cmd('Power', { device });
      return true;
    } catch (error) {
      console.error('IR connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Send raw IR frame data
   * Uses a queue to serialize parallel requests
   */
  async sendRawCommand(frameData: number[], repeat: boolean = false): Promise<boolean> {
    // Check queue size limit
    if (this.queueSize >= this.MAX_QUEUE_SIZE) {
      this.device.error(`Command queue full (${this.MAX_QUEUE_SIZE}), dropping raw command`);
      return false;
    }

    // Voeg het commando toe aan de queue
    this.queueSize++;
    return new Promise((resolve, reject) => {
      this.commandQueue = this.commandQueue
        .then(() => this._sendRawCommandInternal(frameData, repeat))
        .then((result) => {
          this.queueSize--;
          resolve(result);
        })
        .catch((error) => {
          this.queueSize--;
          reject(error);
        });
    });
  }

  /**
   * Internal method that sends the actual raw IR command
   * Always called via the queue
   */
  private async _sendRawCommandInternal(frameData: number[], repeat: boolean = false): Promise<boolean> {
    try {
      // Rate limiting: wait if needed before sending next command
      const now = Date.now();
      const timeSinceLastCommand = now - this.lastCommandTime;

      if (timeSinceLastCommand < this.MIN_COMMAND_INTERVAL_MS) {
        const waitTime = this.MIN_COMMAND_INTERVAL_MS - timeSinceLastCommand;
        this.device.log(`⏱️ Rate limiting: waiting ${waitTime}ms before sending raw command`);
        this.device.error(`TOO fast IR commands`);
        await this.sleep(waitTime);
      }

      // Get repetitions setting (default: 3)
      const repetitions = this.device.getSetting('ir_repetitions') || 3;
      
      // this.device.log('📡 Sending raw IR frame:', frameData, 'repeat:', repeat, 'repetitions:', repetitions);

      await this.signal.tx(frameData, { device: this.device, repetitions });

      // Update last command timestamp
      this.lastCommandTime = Date.now();

      if (repeat) {
        // Use max of setting or 8 for long press
        const repeatRepetitions = Math.max(8, repetitions);
        await this.prontoSignal.cmd('Repeat', {
          repetitions: repeatRepetitions,
          device: this.device
        });
        this.lastCommandTime = Date.now(); // Update timestamp after repeat
      }

      this.emit('raw-command-sent', { frameData, repeat, success: true });
      return true;

    } catch (error: any) {
      this.device.error('Failed to send raw IR command:', error);
      this.emit('raw-command-error', { frameData, repeat, error: error.message });

      if (error.message && error.message.includes('Too Many IR Commands')) {
        this.device.log('Rate limit exceeded, waiting before retry...');
        await this.sleep(1000);
        return false;
      }

      throw error;
    }
  }

  /**
   * Test all IR commands (for development/debugging)
   */
  // async testAllCommands(): Promise<void> {
  //   const { IRUtils } = require('./IRUtils');

  //   this.device.log("Starting IR command test sequence...");

  //   // Power on first
  //   this.device.log("Powering on...");
  //   await this.sendRawCommand([1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1], false);
  //   await this.sleep(2000);

  //   this.device.log("Testing all NEC commands...");

  //   for (let i = 0; i < 256; i++) {
  //     const hexString = "0x" + i.toString(16).toUpperCase().padStart(2, '0');

  //     if (hexString === "0x45") continue; // Skip specific command

  //     this.device.log(`Testing command ${hexString} (${i * 100 / 255}%)`);

  //     const array = IRUtils.necCommandToHomeyBits(i);
  //     await this.sendRawCommand(array, true);
  //     await this.sleep(3000);
  //   }

  //   this.device.log("IR command test sequence completed");
  // }

  /**
   * Convert command string to frame data
   */
  // private getFrameDataForCommand(command: string): number[] | null {
  //   const { IRUtils } = require('./IRUtils');

  //   // Mapping van commando naar hex command code (gebaseerd op IR-CODES.md)
  //   const commandMap: { [key: string]: number } = {
  //     'Power': 0x45,                // 0x45 (Power)
  //     'Timer': 0x47,                // 0x47 (Timer)
  //     'Nebula': 0x44,               // 0x44 (Nebula)
  //     'NebulaBrightness+': 0x09,    // 0x09 (NebulaBrightness+) 
  //     'NebulaBrightness-': 0x15,    // 0x15 (NebulaBrightness-)
  //     'NebulaSpeed+': 0x43,         // 0x43 (NebulaSpeed+)
  //     'NebulaSpeed-': 0x40,         // 0x40 (NebulaSpeed-)
  //     'Star': 0xFF,                 // 0xFF (Star)
  //     'StarBreathing+': 0x19,       // 0x19 (StarBreathing+)
  //     'StarBreathing-': 0x46,       // 0x46 (StarBreathing-)
  //     'StarBrightness+': 0x0D,      // 0x0D (StarBrightness+)
  //     'StarBrightness-': 0x07       // 0x07 (StarBrightness-)
  //   };

  //   const commandCode = commandMap[command];
  //   if (commandCode === undefined) {
  //     return null;
  //   }

  //   // Converteer naar Homey bits format gebruikmakend van IRUtils
  //   return IRUtils.necCommandToHomeyBits(commandCode);
  // }
}

export default Infrared;
