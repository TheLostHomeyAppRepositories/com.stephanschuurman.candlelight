import Homey from 'homey';

module.exports = class GalaxyDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('🚀', this.homey.__('driver.initialized'));

    // Flow action handler voor send_cmd
    const sendCmdAction = this.homey.flow.getActionCard('projector-ir:send_cmd');
    
    // Autocomplete voor beschikbare commando's
    sendCmdAction.registerArgumentAutocompleteListener('cmd', async (query: string) => {
      const commands = [
        { name: 'Power (On/Off)', id: 'Power' },
        { name: 'Timer (45min/90min/Off)', id: 'Timer' },
        { name: '--- Nebula Controls ---', id: 'separator1', disabled: true },
        { name: 'Nebula (On/Off/Next Color)', id: 'Nebula' },
        { name: 'Nebula Brightness +', id: 'NebulaBrightness+' },
        { name: 'Nebula Brightness -', id: 'NebulaBrightness-' },
        { name: 'Nebula Speed +', id: 'NebulaSpeed+' },
        { name: 'Nebula Speed -', id: 'NebulaSpeed-' },
        { name: '--- Star Controls ---', id: 'separator2', disabled: true },
        { name: 'Star (On/Off)', id: 'Star' },
        { name: 'Star Breathing +', id: 'StarBreathing+' },
        { name: 'Star Breathing -', id: 'StarBreathing-' },
        { name: 'Star Brightness +', id: 'StarBrightness+' },
        { name: 'Star Brightness -', id: 'StarBrightness-' }
      ];
      
      return commands
        .filter(cmd => !cmd.disabled && cmd.name.toLowerCase().includes(query.toLowerCase()))
        .map(cmd => ({ name: cmd.name, id: cmd.id }));
    });
    
    // Run listener voor de actie - delegeert naar device
    sendCmdAction.registerRunListener(async (args: any, state: any) => {
      this.log('🔥 Flow action send_cmd called with:', args);
      //this.log('🔥 Device object:', args.device);
      const device = args.device;
      
      // Log device naam en info
      if (device) {
        this.log('Device name:', device.getName());
        this.log('Device ID:', device.getData().id);
        this.log('Device available:', device.getAvailable());
      } else {
        this.log('No device found in args!');
      }
      
      try {
        // Als args.cmd een object is (autocomplete), gebruik dan de id property
        const command = typeof args.cmd === 'object' ? args.cmd.id : args.cmd;
        const isLongPress = args.long_press === 'true' || args.long_press === true;
        
        // Delegeer naar device method
        return await device.sendIRCommand(command, isLongPress);
        
      } catch (error) {
        this.log('Error in flow action:', error);
        throw new Error(`Failed to send IR command: ${args.cmd}`);
      }
    });

    // Flow action handler voor nebula controle
    const nebulaToggleAction = this.homey.flow.getActionCard('projector-ir:nebula_toggle');
    nebulaToggleAction.registerRunListener(async (args: any, state: any) => {
      this.log('🔥 Flow action nebula_toggle called with state:', args.state);
      const device = args.device;
      try {
        // Check of de projector aan staat
        const projectorIsOn = device.getCapabilityValue('onoff');
        if (!projectorIsOn) {
          // Toon notification in plaats van error
          await this.homey.notifications.createNotification({
            excerpt: this.homey.__('notifications.projector_off_nebula')
          });
          this.log('Nebula toggle blocked - projector is off');
          return false; // Return false in plaats van error
        }

        const isOn = args.state === 'on';
        // Send IR command - false for on, true for off (long press for off)
        const success = await device.sendIRCommand('Nebula', !isOn);
        if (success) {
          await device.setCapabilityValue('nebula_onoff', isOn);
        }
        return success;
      } catch (error) {
        this.log('Error in nebula_toggle flow action:', error);
        throw error;
      }
    });

    // Flow action handler voor star controle
    const starsToggleAction = this.homey.flow.getActionCard('projector-ir:stars_toggle');
    starsToggleAction.registerRunListener(async (args: any, state: any) => {
      this.log('🔥 Flow action stars_toggle called with state:', args.state);
      const device = args.device;
      try {
        // Check of de projector aan staat
        const projectorIsOn = device.getCapabilityValue('onoff');
        if (!projectorIsOn) {
          // Toon notification in plaats van error
          await this.homey.notifications.createNotification({
            excerpt: this.homey.__('notifications.projector_off_stars')
          });
          this.log('Star toggle blocked - projector is off');
          return false; // Return false in plaats van error
        }

        const isOn = args.state === 'on';
        // Send IR command - false for on, true for off (long press for off)
        const success = await device.sendIRCommand('Star', !isOn);
        if (success) {
          await device.setCapabilityValue('star_onoff', isOn);
        }
        return success;
      } catch (error) {
        this.log('Error in stars_toggle flow action:', error);
        throw error;
      }
    });
  }

  // /**
  //  * onCapabilityOnoff handles the onoff capability changes
  //  */
  // async onCapabilityOnoff(value: boolean, opts: any) {
  //   this.log('[Driver] onCapabilityOnoff called with value:', value);
  //   return await this.sendIRCommand('Power', false);
  // }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      // Voor IR devices hoeft dit meestal niet gebruikt te worden
      // De pairing gebeurt via de rf_ir_remote templates
    ];
  }

  /**
   * onPair wordt aangeroepen wanneer een pairing session wordt gestart
   */
  async onPair(session: any) {
    // Luister naar pairing events van de RF templates
    session.setHandler('rf_ir_remote_learned', async (signal: any) => {
      this.log('IR remote learned:', signal);
      // Hier kun je extra validatie doen van het geleerde signaal
      return true;
    });

    session.setHandler('rf_ir_remote_test', async (device: any) => {
      this.log('Testing IR device:', device);
      try {
        // Use DeviceApi static method for IR testing
        const ProjectorDeviceApi = require('../../lib/ProjectorDeviceApi');
        const success = await ProjectorDeviceApi.testIRConnectivity(this.homey, device);
        return success;
      } catch (error) {
        this.log('Test failed:', error);
        return false;
      }
    });
  }

};
