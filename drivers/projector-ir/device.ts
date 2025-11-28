import Homey from 'homey';
import ProjectorDeviceApi from '../../lib/ProjectorDeviceApi.js';

module.exports = class GalaxyDevice extends Homey.Device {

  static CAPABILITIES = {
    onoff: 'Power', // Power toggle commando uit je signal definitie
    nebula_dim: 'NebulaBrightness+', // Nebula brightness control (gebruik + commando voor referentie)
    nebula_onoff: 'Nebula', // Nebula on/off toggle
    star_onoff: 'Star', // Star laser on/off toggle
    timer: 'Timer' // Sleep timer command
  }
  
  // State tracking for brightness levels (public voor toegang vanuit ProjectorDeviceApi)
  nebulaBrightness: number = 2; // Default brightness level (0-4)
  nebulaSpeed: number = 1; // Default speed level (0-4)
  
  starBreathing: number = 2; // Default breathing level (0-4)
  starBrightness: number = 1; // Default star brightness (0-2)
  
  timerMode: string = 'off'; // Timer mode: 'off', '45min', '90min'

  // Properties voor state tracking
  powerStateTimer: any;
  deviceApi!: ProjectorDeviceApi;
  
  // State persistence keys
  private static readonly STATE_KEYS = {
    NEBULA_ON: 'nebula_state',
    STAR_ON: 'star_state', 
    NEBULA_BRIGHTNESS: 'nebula_brightness',
    NEBULA_SPEED: 'nebula_speed',
    STAR_BREATHING: 'star_breathing',
    STAR_BRIGHTNESS: 'star_brightness',
    TIMER: 'timer_mode'
  };

  /**
   * Helper method to sleep for a specified number of milliseconds
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Save current projector state to persistent storage
   */
  private async saveProjectorState() {
    try {
      const currentState = {
        nebula_on: this.getCapabilityValue('nebula_onoff'),
        star_on: this.getCapabilityValue('star_onoff'),
        nebula_brightness: this.nebulaBrightness,
        nebula_speed: this.nebulaSpeed,
        star_breathing: this.starBreathing,
        star_brightness: this.starBrightness,
        timer: this.timerMode
      };

      // Save each state component
      await this.setStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_ON, currentState.nebula_on);
      await this.setStoreValue(GalaxyDevice.STATE_KEYS.STAR_ON, currentState.star_on);
      await this.setStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_BRIGHTNESS, currentState.nebula_brightness);
      await this.setStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_SPEED, currentState.nebula_speed);
      await this.setStoreValue(GalaxyDevice.STATE_KEYS.STAR_BREATHING, currentState.star_breathing);
      await this.setStoreValue(GalaxyDevice.STATE_KEYS.STAR_BRIGHTNESS, currentState.star_brightness);
      await this.setStoreValue(GalaxyDevice.STATE_KEYS.TIMER, currentState.timer);

      this.log('Projector state saved:', currentState);
    } catch (error) {
      this.log('Error saving projector state:', error);
    }
  }

  /**
   * Restore projector to previously saved state
   */
  private async restoreProjectorState() {
    try {
      this.log('Restoring projector to previous state...');
      
      // Get saved state values
      const savedNebulaOn = this.getStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_ON);
      const savedStarOn = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_ON);
      const savedNebulaBrightness = this.getStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_BRIGHTNESS) || 2;
      const savedNebulaSpeed = this.getStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_SPEED) || 2;
      const savedStarBreathing = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_BREATHING) || 2;
      const savedStarBrightness = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_BRIGHTNESS) || 1;

      this.log('Restoring state:', {
        nebula: savedNebulaOn,
        star: savedStarOn,
        nebulaBrightness: savedNebulaBrightness,
        nebulaSpeed: savedNebulaSpeed,
        starBreathing: savedStarBreathing,
        starBrightness: savedStarBrightness
      });

      // Wait a moment for the projector to fully boot up
      await this.sleep(250);
      
      // Reset internal state to hardware defaults (projector resets on power-on)
      this.nebulaSpeed = 2; // Hardware default
      this.starBreathing = 2; // Hardware default
      this.starBrightness = 1; // Hardware default
      
      // Restore Nebula on/off settings
      if (!savedNebulaOn)
      {
        await this.deviceApi.toggleNebulaState(true);
        await this.sleep(250);
      }

      // Restore Nebula brightness
      await this.deviceApi.setNebulaBrightness(savedNebulaBrightness);
      await this.sleep(250);
        
      // Set Nebula speed (now calculated from hardware default)
      await this.setNebulaSpeed(savedNebulaSpeed);
      await this.sleep(250);

      // Restore Star on/off settings
      if (!savedStarOn) {
        // Als stars UIT moet zijn, schakel deze uit
        await this.deviceApi.setStarState(true);
        await this.sleep(250);
      }

      // Set star breathing
      await this.setStarBreathing(savedStarBreathing);
      await this.sleep(500);
        
      // Set star brightness (only if breathing is 0)
      if (savedStarBreathing === 0) {
        await this.setStarBrightness(savedStarBrightness);
        await this.sleep(500);
      }
      
      // Update internal state tracking
      this.nebulaBrightness = savedNebulaBrightness;
      this.nebulaSpeed = savedNebulaSpeed;
      this.starBreathing = savedStarBreathing;
      this.starBrightness = savedStarBrightness;

      // Update capability values
      await this.setCapabilityValue('nebula_onoff', savedNebulaOn || false);
      await this.setCapabilityValue('nebula_speed', savedNebulaSpeed);
      await this.setCapabilityValue('star_onoff', savedStarOn || false);
      await this.setCapabilityValue('star_breathing', savedStarBreathing);
      await this.setCapabilityValue('star_brightness', savedStarBrightness);
      await this.setCapabilityValue('nebula_dim', savedNebulaBrightness / 4);

      this.log('Projector state restoration completed');
    } catch (error) {
      this.log('Error restoring projector state:', error);
    }
  }

  /**
   * Load saved state during device initialization
   */
  private async loadSavedState() {
    try {
      // Load saved state values (use null check to detect first-time initialization)
      const savedNebulaBrightness = this.getStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_BRIGHTNESS);
      const savedNebulaSpeed = this.getStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_SPEED);
      const savedStarBreathing = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_BREATHING);
      const savedStarBrightness = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_BRIGHTNESS);
      const savedNebulaOn = this.getStoreValue(GalaxyDevice.STATE_KEYS.NEBULA_ON);
      const savedStarOn = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_ON);
      const savedTimer = this.getStoreValue(GalaxyDevice.STATE_KEYS.TIMER);

      // Determine if this is first-time initialization (no saved state exists)
      const isFirstTime = savedNebulaOn === null || savedNebulaOn === undefined;

      // Set defaults with first-time special handling
      const nebulaBrightness = savedNebulaBrightness ?? 2;
      const nebulaSpeed = savedNebulaSpeed ?? 2;
      const starBreathing = savedStarBreathing ?? 2;
      const starBrightness = savedStarBrightness ?? 1;
      const nebulaOn = isFirstTime ? true : (savedNebulaOn || false); // Default ON for first time
      const starOn = isFirstTime ? true : (savedStarOn || false); // Default ON for first time
      const timerMode = savedTimer ?? 'off';

      // Update internal state tracking
      this.nebulaBrightness = nebulaBrightness;
      this.nebulaSpeed = nebulaSpeed;
      this.starBreathing = starBreathing;
      this.starBrightness = starBrightness;
      this.timerMode = timerMode;

      // Set capability values (without triggering IR commands)
      await this.setCapabilityValue('onoff', false); // Projector starts off
      await this.setCapabilityValue('nebula_dim', this.nebulaBrightness / 4);
      await this.setCapabilityValue('nebula_onoff', nebulaOn);
      await this.setCapabilityValue('nebula_speed', this.nebulaSpeed);
      await this.setCapabilityValue('star_onoff', starOn);
      await this.setCapabilityValue('star_breathing', this.starBreathing);
      await this.setCapabilityValue('star_brightness', this.starBrightness);
      await this.setCapabilityValue('timer', this.timerMode);

      this.log('Device initialized with' + (isFirstTime ? ' DEFAULT' : ' SAVED') + ' state:', {
        nebulaBrightness: nebulaBrightness,
        nebulaSpeed: nebulaSpeed,
        starBreathing: starBreathing,
        starBrightness: starBrightness,
        nebula: nebulaOn,
        star: starOn,
        timer: timerMode
      });

      // Save initial state if this is first time
      if (isFirstTime) {
        await this.saveProjectorState();
      }

    } catch (error) {
      this.log('Error loading saved state, using defaults:', error);
      
      // Set default values
      this.nebulaBrightness = 2;
      this.nebulaSpeed = 2;
      this.starBreathing = 2;
      this.starBrightness = 1;
      
      await this.setCapabilityValue('onoff', false);
      await this.setCapabilityValue('nebula_dim', 0.5); // Default brightness level 2 of 5 (0-4)
      await this.setCapabilityValue('nebula_onoff', true); // Default ON
      await this.setCapabilityValue('nebula_speed', 2);
      await this.setCapabilityValue('star_onoff', true); // Default ON
      await this.setCapabilityValue('star_breathing', 2);
      await this.setCapabilityValue('star_brightness', 1);
    }
  }

  /**
   * Set nebula speed (0-4 levels: 0=static, 1-4=speed levels)
   */
  private async setNebulaSpeed(targetLevel: number): Promise<boolean> {
    const currentLevel = this.nebulaSpeed;
    const diff = targetLevel - currentLevel;
    
    if (diff === 0) {
      return true; // Already at target level
    }

    const command = diff > 0 ? 'NebulaSpeed+' : 'NebulaSpeed-';
    const steps = Math.abs(diff);

    try {
      for (let i = 0; i < steps; i++) {
        await this.deviceApi.sendCommand(command, false);
        await this.sleep(200);
      }
      
      this.nebulaSpeed = targetLevel;
      this.log('Nebula speed set to:', targetLevel);
      return true;
      
    } catch (error) {
      this.log('Failed to set nebula speed:', error);
      return false;
    }
  }

  /**
   * Set star breathing (0-3 levels: 0=always on, 1-3=breathing levels)
   */
  private async setStarBreathing(targetLevel: number): Promise<boolean> {
    const currentLevel = this.starBreathing;
    const diff = targetLevel - currentLevel;
    
    if (diff === 0) {
      return true; // Already at target level
    }

    const command = diff > 0 ? 'StarBreathing+' : 'StarBreathing-';
    const steps = Math.abs(diff);

    try {
      for (let i = 0; i < steps; i++) {
        await this.deviceApi.sendCommand(command, false);
        await this.sleep(200);
      }
      
      this.starBreathing = targetLevel;
      this.log('Star breathing set to:', targetLevel);
      return true;
      
    } catch (error) {
      this.log('Failed to set star breathing:', error);
      return false;
    }
  }

  /**
   * Set star brightness (0-2 levels, only works when breathing = 0)
   */
  private async setStarBrightness(targetLevel: number): Promise<boolean> {
    if (this.starBreathing !== 0) {
      this.log('Star brightness can only be set when breathing is 0');
      return false;
    }

    const currentLevel = this.starBrightness;
    const diff = targetLevel - currentLevel;
    
    if (diff === 0) {
      return true; // Already at target level
    }

    const command = diff > 0 ? 'StarBrightness+' : 'StarBrightness-';
    const steps = Math.abs(diff);

    try {
      for (let i = 0; i < steps; i++) {
        await this.deviceApi.sendCommand(command, false);
        await this.sleep(200);
      }
      
      this.starBrightness = targetLevel;
      this.log('Star brightness set to:', targetLevel);
      return true;
      
    } catch (error) {
      this.log('Failed to set star brightness:', error);
      return false;
    }
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {

    this.log('🌟', this.homey.__('device.initialized'));
    
    // Initialiseer Device API
    this.deviceApi = new ProjectorDeviceApi(this);
    await this.deviceApi.init();
    
    // Luister naar Device API events
    this.deviceApi.on('power-state-changed', (isOn: boolean) => {
      this.setCapabilityValue('onoff', isOn).catch(this.error);
    });

    this.deviceApi.on('nebula-state-changed', (isOn: boolean) => {
      this.setCapabilityValue('nebula_onoff', isOn).catch(this.error);
    });

    this.deviceApi.on('star-state-changed', (isOn: boolean) => {
      this.setCapabilityValue('star_onoff', isOn).catch(this.error);
    });

    this.deviceApi.on('nebula-brightness-changed', (level: number) => {
      const dimValue = level / 4; // Convert 0-4 to 0-1
      this.setCapabilityValue('nebula_dim', dimValue).catch(this.error);
    });
    
    // Registreer capability listeners
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('nebula_dim', this.onCapabilityNebulaDim.bind(this));
    this.registerCapabilityListener('nebula_onoff', this.onCapabilityNebulaOnoff.bind(this));
    this.registerCapabilityListener('nebula_speed', this.onCapabilityNebulaSpeed.bind(this));
    this.registerCapabilityListener('star_onoff', this.onCapabilityStarOnoff.bind(this));
    this.registerCapabilityListener('star_breathing', this.onCapabilityStarBreathing.bind(this));
    this.registerCapabilityListener('star_brightness', this.onCapabilityStarBrightness.bind(this));
    this.registerCapabilityListener('timer', this.onCapabilityTimer.bind(this));
    
    // Initialiseer power state tracking
    this.powerStateTimer = null;
    
    // Initialize capabilities
    if (!this.hasCapability('onoff')) {
      await this.addCapability('onoff');
    }
    if (!this.hasCapability('nebula_dim')) {
      await this.addCapability('nebula_dim');
    }
    if (!this.hasCapability('nebula_onoff')) {
      await this.addCapability('nebula_onoff');
    }
    if (!this.hasCapability('nebula_speed')) {
      await this.addCapability('nebula_speed');
    }
    if (!this.hasCapability('star_onoff')) {
      await this.addCapability('star_onoff');
    }
    if (!this.hasCapability('star_breathing')) {
      await this.addCapability('star_breathing');
    }
    if (!this.hasCapability('star_brightness')) {
      await this.addCapability('star_brightness');
    }
    if (!this.hasCapability('timer')) {
      await this.addCapability('timer');
    }
    
    // Load and apply saved state or set defaults
    await this.loadSavedState();

    // this.testAllCommands();

  }

  async testAllCommands() {
    // Delegate to DeviceApi for all IR testing
    await this.deviceApi.testAllCommands();
  }

  /**
   * Send IR command with rate limiting protection
   */
  async sendIRCommand(command: string, repeat: boolean = false): Promise<boolean> {
    this.log('Sending IR command via DeviceApi:', command, 'Long press:', repeat);
    
    try {
      // Check if projector needs to be on for this command
      const requiresPowerOn = [
        'Nebula', 'NebulaBrightness+', 'NebulaBrightness-', 'NebulaSpeed+', 'NebulaSpeed-',
        'Star', 'StarBrightness+', 'StarBrightness-', 'StarBreathing+', 'StarBreathing-'
      ];
      
      if (requiresPowerOn.includes(command)) {
        const projectorIsOn = this.getCapabilityValue('onoff');
        if (!projectorIsOn) {
          // Toon notification in plaats van error
          await this.homey.notifications.createNotification({
            excerpt: this.homey.__('notifications.projector_off_general')
          });
          this.log('Command blocked - projector is off:', command);
          return false; // Return false in plaats van error gooien
        }
      }

      // Use DeviceApi for centralized IR communication
      return await this.deviceApi.sendCommand(command, repeat);
    } catch (error: any) {
      this.log('Error sending IR command via DeviceApi:', error);
      throw error;
    }
  }

  async sendIRCommandRaw(frameData: number[], repeat: boolean = false): Promise<boolean> {
    // Delegate to DeviceApi for all raw IR communication
    return await this.deviceApi.sendRawCommand(frameData, repeat);
  } 

  /**
   * Handle onoff capability changes
   */
  async onCapabilityOnoff(value: boolean, opts: any): Promise<void> {
    this.log('[Device] onCapabilityOnoff called with value:', value);
    
    try {
      const currentState = this.getCapabilityValue('onoff');
      
      // Alleen commando sturen als de staat daadwerkelijk moet veranderen
      if (currentState !== value) {
        if (value === false) {
          // Save current state before turning off
          await this.saveProjectorState();
        }
        
        await this.deviceApi.setPowerState(value);
        
        // Voor projectors: als we aanzetten, blijft het waarschijnlijk aan
        // Als we uitzetten, kunnen we aannemen dat het na 30 seconden uit is
        if (value === false) {
          // Projectors hebben vaak een cooldown periode
          this.scheduleAutoOff(0);
        } else {
          // Cancel eventuele auto-off timer als we aanzetten
          this.cancelAutoOff();
          
          // When turning on, restore previous state after a delay
          this.homey.setTimeout(async () => {
            await this.restoreProjectorState();
          }, 500); // Wait 0.5 seconds for projector to fully boot
        }
        
        this.log('Power state updated to:', value);
      } else {
        this.log('Power state already', value, '- no IR command sent');
      }
    } catch (error) {
      this.log('Error in onCapabilityOnoff:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic power off 
   */
  scheduleAutoOff(delay: number) {
    this.cancelAutoOff(); // Cancel bestaande timer
    
    this.powerStateTimer = this.homey.setTimeout(async () => {
      this.log('Auto-updating power state to OFF after cooldown');
      await this.setCapabilityValue('onoff', false);
    }, delay);

  }

  /**
   * Cancel automatic power off timer
   */
  cancelAutoOff() {
    if (this.powerStateTimer) {
      this.homey.clearTimeout(this.powerStateTimer);
      this.powerStateTimer = null;
    }
  }

  /**
   * Handle nebula_dim capability changes (Nebula brightness)
   */
  async onCapabilityNebulaDim(value: number, opts: any): Promise<void> {
    this.log('[Device] onCapabilityNebulaDim called with value:', value);
    
    try {
      // Convert 0-1 range to 0-4 brightness levels
      const targetLevel = Math.max(0, Math.min(4, Math.round(value * 4)));
      
      // Check of de projector aan staat
      const projectorIsOn = this.getCapabilityValue('onoff');
      if (!projectorIsOn) {
        // Projector is uit - sla status op maar verstuur geen IR commando
        this.nebulaBrightness = targetLevel;
        await this.saveProjectorState();
        this.log('Brightness change saved (projector off) - will apply on next power on:', targetLevel);
        
        // Toon notification
        await this.homey.notifications.createNotification({
          excerpt: this.homey.__('notifications.projector_off_brightness')
        });
        return; // Stop zonder IR commando te versturen
      }

      // Projector is aan - verstuur IR commando
      const success = await this.deviceApi.setNebulaBrightness(targetLevel);
      
      if (success) {
        this.nebulaBrightness = targetLevel;
        this.log('Nebula brightness updated to level:', targetLevel);
        
        // Save state after change
        await this.saveProjectorState();
      }
    } catch (error) {
      this.log('Error in onCapabilityNebulaDim:', error);
      throw error;
    }
  }

  /**
   * Handle nebula_onoff capability changes
   */
  async onCapabilityNebulaOnoff(value: boolean, opts: any): Promise<void> {
    this.log('[Device] onCapabilityNebulaOnoff called with value:', value);
    
    try {
      const currentState = this.getCapabilityValue('nebula_onoff');
      
      // Check of de projector aan staat
      const projectorIsOn = this.getCapabilityValue('onoff');
      if (!projectorIsOn) {
        // Projector is uit - sla status op maar verstuur geen IR commando
        if (currentState !== value) {
          // Update capability value en sla op
          await this.setCapabilityValue('nebula_onoff', value);
          await this.saveProjectorState();
          this.log('Nebula state saved (projector off) - will apply on next power on:', value);
        }
        
        // Toon notification
        await this.homey.notifications.createNotification({
          excerpt: this.homey.__('notifications.projector_off_nebula')
        });
        return; // Stop zonder IR commando te versturen
      }

      // Projector is aan - verstuur IR commando
      if (currentState !== value) {
        // Use DeviceApi to set nebula state
        // Inverteer de waarde: value=true (aan) betekent switchOff=false
        await this.deviceApi.toggleNebulaState(!value);
        
        this.log('Nebula state updated to:', value);
        
        // Save state after change
        await this.saveProjectorState();
      } else {
        this.log('Nebula state already', value, '- no IR command sent');
      }
    } catch (error) {
      this.log('Error in onCapabilityNebulaOnoff:', error);
      throw error;
    }
  }

  /**
   * Handle star_onoff capability changes
   */
  async onCapabilityStarOnoff(value: boolean, opts: any): Promise<void> {
    this.log('[Device] onCapabilityStarOnoff called with value:', value);
    
    try {
      const currentState = this.getCapabilityValue('star_onoff');
      
      // Check of de projector aan staat
      const projectorIsOn = this.getCapabilityValue('onoff');
      if (!projectorIsOn) {
        // Projector is uit - sla status op maar verstuur geen IR commando
        if (currentState !== value) {
          // Update capability value en sla op
          await this.setCapabilityValue('star_onoff', value);
          await this.saveProjectorState();
          this.log('Star state saved (projector off) - will apply on next power on:', value);
        }
        
        // Toon notification
        await this.homey.notifications.createNotification({
          excerpt: this.homey.__('notifications.projector_off_stars')
        });
        return; // Stop zonder IR commando te versturen
      }

      // Projector is aan - verstuur IR commando
      if (currentState !== value) {
        // Use DeviceApi to set star state
        // Inverteer de waarde: value=true (aan) betekent switchOff=false
        await this.deviceApi.setStarState(!value);
        
        this.log('Star state updated to:', value);
        
        // Als sterren worden aangezet, herstel de opgeslagen settings
        if (value === true) {
          // Hardware reset naar defaults bij aanzetten, dus herstel de juiste waardes
          await this.sleep(250);
          
          // Reset internal state naar hardware defaults
          this.starBreathing = 2;
          this.starBrightness = 1;
          
          // Get saved values
          const savedStarBreathing = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_BREATHING) || 2;
          const savedStarBrightness = this.getStoreValue(GalaxyDevice.STATE_KEYS.STAR_BRIGHTNESS) || 1;
          
          // Restore breathing
          await this.setStarBreathing(savedStarBreathing);
          await this.sleep(250);
          
          // Restore brightness (only if breathing is 0)
          if (savedStarBreathing === 0) {
            await this.setStarBrightness(savedStarBrightness);
            await this.sleep(250);
          }
          
          // Update capability values
          await this.setCapabilityValue('star_breathing', savedStarBreathing);
          await this.setCapabilityValue('star_brightness', savedStarBrightness);
        }
        
        // Save state after change
        await this.saveProjectorState();
      } else {
        this.log('Star state already', value, '- no IR command sent');
      }
    } catch (error) {
      this.log('Error in onCapabilityStarOnoff:', error);
      throw error;
    }
  }

  /**
   * Handle nebula_speed capability changes
   */
  async onCapabilityNebulaSpeed(value: number, opts: any): Promise<void> {
    this.log('[Device] onCapabilityNebulaSpeed called with value:', value);
    
    try {
      const targetLevel = Math.round(value);
      
      // Check of de projector aan staat
      const projectorIsOn = this.getCapabilityValue('onoff');
      if (!projectorIsOn) {
        // Projector is uit - sla status op maar verstuur geen IR commando
        this.nebulaSpeed = targetLevel;
        await this.saveProjectorState();
        this.log('Nebula speed saved (projector off) - will apply on next power on:', targetLevel);
        
        // Toon notification
        await this.homey.notifications.createNotification({
          excerpt: this.homey.__('notifications.projector_off_general')
        });
        return;
      }

      // Projector is aan - verstuur IR commando
      const success = await this.setNebulaSpeed(targetLevel);
      
      if (success) {
        this.log('Nebula speed updated to level:', targetLevel);
        await this.saveProjectorState();
      }
    } catch (error) {
      this.log('Error in onCapabilityNebulaSpeed:', error);
      throw error;
    }
  }

  /**
   * Handle star_breathing capability changes
   */
  async onCapabilityStarBreathing(value: number, opts: any): Promise<void> {
    this.log('[Device] onCapabilityStarBreathing called with value:', value);
    
    try {
      const targetLevel = Math.round(value);
      
      // Check of de projector aan staat
      const projectorIsOn = this.getCapabilityValue('onoff');
      if (!projectorIsOn) {
        // Projector is uit - sla status op maar verstuur geen IR commando
        this.starBreathing = targetLevel;
        await this.saveProjectorState();
        this.log('Star breathing saved (projector off) - will apply on next power on:', targetLevel);
        
        // Toon notification
        await this.homey.notifications.createNotification({
          excerpt: this.homey.__('notifications.projector_off_general')
        });
        return;
      }

      // Projector is aan - verstuur IR commando
      const success = await this.setStarBreathing(targetLevel);
      
      if (success) {
        this.log('Star breathing updated to level:', targetLevel);
        await this.saveProjectorState();
      }
    } catch (error) {
      this.log('Error in onCapabilityStarBreathing:', error);
      throw error;
    }
  }

  /**
   * Handle star_brightness capability changes
   */
  async onCapabilityStarBrightness(value: number, opts: any): Promise<void> {
    this.log('[Device] onCapabilityStarBrightness called with value:', value);
    
    try {
      const targetLevel = Math.round(value);
      
      // Check of de projector aan staat
      const projectorIsOn = this.getCapabilityValue('onoff');
      if (!projectorIsOn) {
        // Projector is uit - sla status op maar verstuur geen IR commando
        this.starBrightness = targetLevel;
        await this.saveProjectorState();
        this.log('Star brightness saved (projector off) - will apply on next power on:', targetLevel);
        
        // Toon notification
        await this.homey.notifications.createNotification({
          excerpt: this.homey.__('notifications.projector_off_general')
        });
        return;
      }

      // Projector is aan - verstuur IR commando
      const success = await this.setStarBrightness(targetLevel);
      
      if (success) {
        this.log('Star brightness updated to level:', targetLevel);
        await this.saveProjectorState();
      }
    } catch (error) {
      this.log('Error in onCapabilityStarBrightness:', error);
      throw error;
    }
  }

  /**
   * Handle timer capability changes
   */
  async onCapabilityTimer(value: string, opts: any): Promise<void> {
    this.log('[Device] onCapabilityTimer called with value:', value);
    
    try {
      // Check of de projector aan staat
      const projectorIsOn = this.getCapabilityValue('onoff');
      if (!projectorIsOn) {
        // Projector is uit - sla status op maar verstuur geen IR commando
        this.timerMode = value;
        await this.setCapabilityValue('timer', value);
        await this.saveProjectorState();
        this.log('Timer mode saved (projector off) - will apply on next power on:', value);
        
        // Toon notification
        await this.homey.notifications.createNotification({
          excerpt: this.homey.__('notifications.projector_off_general')
        });
        return;
      }

      // Projector is aan - verstuur IR commando
      // Timer werkt met kort/lang drukken:
      // - Kort druk: cycle door 0 -> 45min -> 90min
      // - Lang druk: reset naar 0 (off)
      
      const currentMode = this.timerMode;
      
      // Determine how many presses needed
      let pressCount = 0;
      if (value === 'off' && currentMode !== 'off') {
        // Use long press to turn off
        await this.deviceApi.sendCommand('Timer', true); // long press
        pressCount = 1;
      } else if (value === '45min') {
        if (currentMode === 'off') pressCount = 1;
        else if (currentMode === '90min') pressCount = 2;
      } else if (value === '90min') {
        if (currentMode === 'off') pressCount = 2;
        else if (currentMode === '45min') pressCount = 1;
      }
      
      // Send short presses to cycle through modes
      for (let i = 0; i < pressCount; i++) {
        await this.deviceApi.sendCommand('Timer', false);
        await this.sleep(300);
      }
      
      this.timerMode = value;
      await this.setCapabilityValue('timer', value);
      await this.saveProjectorState();
      this.log('Timer mode updated to:', value);
      
    } catch (error) {
      this.log('Error in onCapabilityTimer:', error);
      throw error;
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('🌟', this.homey.__('device.added'));
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
    this.log('⚙️', this.homey.__('device.settings_changed'));
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('✏️', this.homey.__('device.renamed'), name);
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('🗑️', this.homey.__('device.deleted'));
    
    // Cleanup timers
    this.cancelAutoOff();
  }

};