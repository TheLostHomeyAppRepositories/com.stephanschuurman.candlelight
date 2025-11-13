import Homey from 'homey';
import { RFDevice } from 'homey-rfdriver';

/**
 * Interface voor GalaxyDevice met custom properties
 * Extend Homey.Device met de specifieke properties die ProjectorDeviceApi nodig heeft
 */
interface IGalaxyDevice extends RFDevice {
  nebulaBrightness?: number;
  starBreathing?: number;
  nebulaSpeed?: number;
  starBrightness?: number;
}

/**
 * DeviceApi class voor het centraliseren van IR communicatie
 * Volgt het Homey patroon voor device API's
 */
class ProjectorDeviceApi extends Homey.SimpleClass {
  
  private device: IGalaxyDevice;
  private signal: any;
  private prontoSignal: any;
  private lastCommandTime: number = 0;
  private readonly MIN_COMMAND_INTERVAL_MS: number = 500; // Minimaal 250ms tussen commando's
  private commandQueue: Promise<any> = Promise.resolve(); // Queue voor het serialiseren van commando's

  constructor(device: IGalaxyDevice) {
    super();
    this.device = device;
  }

  /**
   * Initialiseer de API met de benodigde IR signals
   */
  async init() {
    try {
      this.signal = this.device.homey.rf.getSignalInfrared('nec');
      this.prontoSignal = this.device.homey.rf.getSignalInfrared('nec-pronto');
      this.device.log('ProjectorDeviceApi initialized');
    } catch (error) {
      this.device.error('Failed to initialize ProjectorDeviceApi:', error);
      throw error;
    }
  }

  /**
   * Stuur een IR commando naar de projector
   * Gebruikt een queue om parallelle requests te serialiseren
   */
  async sendCommand(command: string, longPress: boolean = false): Promise<boolean> {
    // Voeg het commando toe aan de queue
    return new Promise((resolve, reject) => {
      this.commandQueue = this.commandQueue
        .then(() => this._sendCommandInternal(command, longPress))
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Interne methode die het daadwerkelijke IR commando verstuurt
   * Deze wordt altijd geserialiseerd via de queue aangeroepen
   */
  private async _sendCommandInternal(command: string, longPress: boolean = false): Promise<boolean> {
    try {
      // Rate limiting: wacht indien nodig voordat we het volgende commando versturen
      const now = Date.now();
      const timeSinceLastCommand = now - this.lastCommandTime;
      
      if (timeSinceLastCommand < this.MIN_COMMAND_INTERVAL_MS) {
        const waitTime = this.MIN_COMMAND_INTERVAL_MS - timeSinceLastCommand;
        this.device.log(`⏱️ Rate limiting: waiting ${waitTime}ms before sending command`);
        await this.sleep(waitTime);
      }
      
      this.device.log(`📡 Sending IR command: ${command} (longPress: ${longPress})`);
      
      // Converteer commando naar frame data
      const frameData = this.getFrameDataForCommand(command);
      if (!frameData) {
        throw new Error(`Unknown command: ${command}`);
      }

      await this.signal.cmd(command, { device: this.device });
      
      // Update laatste commando tijd
      this.lastCommandTime = Date.now();

      // Verstuur het frame
      //await this.signal.tx(frameData, { device: this.device });

      // Voor long press, verstuur herhaling
      if (longPress) {
        await this.prontoSignal.cmd('Repeat', { 
          repetitions: 10, // min. 8 required for long press
          device: this.device 
        });
        await this.sleep(200); // Korte pauze na long press
        this.lastCommandTime = Date.now(); // Update tijd na long press
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
   * Set projector power state
   */
  async setPowerState(isOn: boolean): Promise<boolean> {
    const success = await this.sendCommand('Power', false);
    if (success) {
      this.emit('power-state-changed', isOn);
    }
    return success;
  }

  /**
   * Set nebula state
   */
  async toggleNebulaState(switchOff: boolean): Promise<boolean> {
    const success = await this.sendCommand('Nebula', switchOff);
    if (success) {
      this.emit('nebula-state-changed', !switchOff);
    }
    return success;
  }

  /**
   * Set star state  
   */
  async setStarState(switchOff: boolean): Promise<boolean> {
    const success = await this.sendCommand('Star', switchOff);
    if (success) {
      this.emit('star-state-changed', !switchOff);
    }
    return success;
  }

  /**
   * Set nebula brightness (0-4 levels)
   */
  async setNebulaBrightness(targetLevel: number): Promise<boolean> {
    const currentLevel = this.device.nebulaBrightness || 2;
    const diff = targetLevel - currentLevel;
    
    if (diff === 0) {
      return true; // Already at target level
    }

    const command = diff > 0 ? 'NebulaBrightness+' : 'NebulaBrightness-';
    const steps = Math.abs(diff);

    try {
      for (let i = 0; i < steps; i++) {
        await this.sendCommand(command, false);
        await this.sleep(200); // Small delay between commands
      }
      
      // Don't update device state here - let the device handle it
      // this.device.nebulaBrightness = targetLevel;
      this.emit('nebula-brightness-changed', targetLevel);
      return true;
      
    } catch (error) {
      this.device.error('Failed to set nebula brightness:', error);
      return false;
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
   * Gebruikt een queue om parallelle requests te serialiseren
   */
  async sendRawCommand(frameData: number[], repeat: boolean = false): Promise<boolean> {
    // Voeg het commando toe aan de queue
    return new Promise((resolve, reject) => {
      this.commandQueue = this.commandQueue
        .then(() => this._sendRawCommandInternal(frameData, repeat))
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Interne methode die het daadwerkelijke raw IR commando verstuurt
   * Deze wordt altijd geserialiseerd via de queue aangeroepen
   */
  private async _sendRawCommandInternal(frameData: number[], repeat: boolean = false): Promise<boolean> {
    try {
      // Rate limiting: wacht indien nodig voordat we het volgende commando versturen
      const now = Date.now();
      const timeSinceLastCommand = now - this.lastCommandTime;
      
      if (timeSinceLastCommand < this.MIN_COMMAND_INTERVAL_MS) {
        const waitTime = this.MIN_COMMAND_INTERVAL_MS - timeSinceLastCommand;
        this.device.log(`⏱️ Rate limiting: waiting ${waitTime}ms before sending raw command`);
        await this.sleep(waitTime);
      }
      
      this.device.log('📡 Sending raw IR frame:', frameData, 'repeat:', repeat);
      
      await this.signal.tx(frameData, { device: this.device });
      
      // Update laatste commando tijd
      this.lastCommandTime = Date.now();
      
      if (repeat) {
        await this.prontoSignal.cmd('Repeat', { 
          repetitions: 8, 
          device: this.device 
        });
        this.lastCommandTime = Date.now(); // Update tijd na repeat
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
  async testAllCommands(): Promise<void> {
    const { IRUtils } = require('./IRUtils');
    
    this.device.log("Starting IR command test sequence...");

    // Power on first
    this.device.log("Powering on...");
    await this.sendRawCommand([1,0,1,0,0,0,1,0, 0,1,0,1,1,1,0,1], false);
    await this.sleep(2000);

    this.device.log("Testing all NEC commands...");
    
    for (let i = 0; i < 256; i++) {
      const hexString = "0x" + i.toString(16).toUpperCase().padStart(2, '0');
      
      if (hexString === "0x45") continue; // Skip specific command
      
      this.device.log(`Testing command ${hexString} (${i * 100 / 255}%)`);
      
      const array = IRUtils.necCommandToHomeyBits(i);
      await this.sendRawCommand(array, true);
      await this.sleep(3000);
    }
    
    this.device.log("IR command test sequence completed");
  }

  /**
   * Convert command string to frame data
   */
  private getFrameDataForCommand(command: string): number[] | null {
    const { IRUtils } = require('./IRUtils');
    
    // Mapping van commando naar hex command code (gebaseerd op IR-CODES.md)
    const commandMap: { [key: string]: number } = {
      'Power': 0x45,                // 0x45 (Power)
      'Timer': 0x47,                // 0x47 (Timer)
      'Nebula': 0x44,               // 0x44 (Nebula)
      'NebulaBrightness+': 0x09,    // 0x09 (NebulaBrightness+) 
      'NebulaBrightness-': 0x15,    // 0x15 (NebulaBrightness-)
      'NebulaSpeed+': 0x43,         // 0x43 (NebulaSpeed+)
      'NebulaSpeed-': 0x40,         // 0x40 (NebulaSpeed-)
      'Star': 0xFF,                 // 0xFF (Star)
      'StarBreathing+': 0x19,       // 0x19 (StarBreathing+)
      'StarBreathing-': 0x46,       // 0x46 (StarBreathing-)
      'StarBrightness+': 0x0D,      // 0x0D (StarBrightness+)
      'StarBrightness-': 0x07       // 0x07 (StarBrightness-)
    };

    const commandCode = commandMap[command];
    if (commandCode === undefined) {
      return null;
    }

    // Converteer naar Homey bits format gebruikmakend van IRUtils
    return IRUtils.necCommandToHomeyBits(commandCode);
  }
}

export default ProjectorDeviceApi;