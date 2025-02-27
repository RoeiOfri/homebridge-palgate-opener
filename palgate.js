const { generateToken } = require('./token_generator.js');

module.exports = (api) => {
  api.registerAccessory('PalGateOpener', PalGateOpener);
};

class PalGateOpener {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.deviceId = config.deviceId;
    this.token = config.token;
    this.tokenType = config.tokenType;
    this.phoneNumber = config.phoneNumber;
    this.accessoryType = (config.accessoryType || 'switch').toLowerCase();
    this.name = config.name;
    this.httpAddress = `https://api1.pal-es.com/v1/bt/device/${this.deviceId}/open-gate?outputNum=1`;
    this.resetDelay = config.resetDelay || 5000; // Default 5 seconds, configurable

    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    this.log.debug('PalGate Accessory Plugin Loaded');
    this.log.debug('deviceID:', this.deviceId);
    this.log.debug('token:', this.token);
    this.log.debug('phoneNumber:', this.phoneNumber);

    if (!['switch', 'garagedoor'].includes(this.accessoryType)) {
      this.log.warn('Accessory Type is not supported, defaulting to "switch"');
      this.accessoryType = 'switch';
    }

    this.informationService = new this.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, 'Pal Systems')
      .setCharacteristic(this.Characteristic.Model, 'PalGate App');

    this.initializeService();
  }

  initializeService() {
    switch (this.accessoryType) {
      case 'switch':
        this.service = new this.Service.Switch(this.name);
        this.service.getCharacteristic(this.Characteristic.On)
          .on('get', this.getOnHandler.bind(this))
          .on('set', this.setOnHandler.bind(this));
        break;

      case 'garagedoor':
        this.service = new this.Service.GarageDoorOpener(this.name);
        this.service.getCharacteristic(this.Characteristic.CurrentDoorState)
          .on('get', this.handleCurrentDoorStateGet.bind(this));
        this.service.getCharacteristic(this.Characteristic.TargetDoorState)
          .on('get', this.handleTargetDoorStateGet.bind(this))
          .on('set', this.handleTargetDoorStateSet.bind(this));
        break;
    }
  }

  getServices() {
    return [this.informationService, this.service];
  }

  handleCurrentDoorStateGet(callback) {
    this.log.debug('Triggered GET CurrentDoorState');
    const currentValue = this.Characteristic.CurrentDoorState.CLOSED;
    callback(null, currentValue);
  }

  handleTargetDoorStateGet(callback) {
    this.log.debug('Triggered GET TargetDoorState');
    const targetDoorState = this.Characteristic.CurrentDoorState.CLOSED;
    callback(null, targetDoorState);
  }

  async handleTargetDoorStateSet(value, callback) {
    this.log.debug('Checking values before generating token...');
    this.log.debug('Token:', this.token);
    this.log.debug('Phone Number:', this.phoneNumber);

    try {
      const temporalToken = await this.generateTemporalToken();
      if (value === this.Characteristic.TargetDoorState.OPEN) {
        await this.openGate(temporalToken);
        this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.Characteristic.CurrentDoorState.OPEN);
        
        // Reset to CLOSED after delay
        setTimeout(() => {
          this.log.debug('Resetting gate to CLOSED state');
          this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.Characteristic.CurrentDoorState.CLOSED);
          this.service.setCharacteristic(this.Characteristic.TargetDoorState, this.Characteristic.TargetDoorState.CLOSED);
        }, this.resetDelay);
      } else if (value === this.Characteristic.TargetDoorState.CLOSED) {
        this.log.debug('Gate already closed or closing...');
        this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.Characteristic.CurrentDoorState.CLOSED);
      }
      callback(null);
    } catch (error) {
      this.log.error('Error in handleTargetDoorStateSet:', error.message);
      callback(error);
    }
  }

  getOnHandler(callback) {
    this.log.debug('Getting switch state');
    callback(null, false); // Default to off since we reset after opening
  }

  async setOnHandler(value, callback) {
    this.log.debug('Checking values before generating token...');
    this.log.debug('Token:', this.token);
    this.log.debug('Phone Number:', this.phoneNumber);

    try {
      if (value) {
        const temporalToken = await this.generateTemporalToken();
        await this.openGate(temporalToken);
        this.service.setCharacteristic(this.Characteristic.On, true);

        // Reset switch to OFF after delay
        setTimeout(() => {
          this.log.debug('Resetting switch to OFF');
          this.service.setCharacteristic(this.Characteristic.On, false);
        }, this.resetDelay);
      }
      callback(null);
    } catch (error) {
      this.log.error('Error in setOnHandler:', error.message);
      callback(error);
    }
  }

  async generateTemporalToken() {
    if (!this.token || typeof this.token !== 'string' || !/^[0-9a-fA-F]{32}$/.test(this.token)) {
      throw new Error('Token is missing or invalid');
    }
    if (!this.phoneNumber || isNaN(parseInt(this.phoneNumber, 10))) {
      throw new Error('Phone number is missing or invalid');
    }
    const temporalToken = generateToken(Buffer.from(this.token, 'hex'), parseInt(this.phoneNumber, 10), this.tokenType);
    this.log.debug('Generated temp token:', temporalToken);
    return temporalToken;
  }

  async openGate(temporalToken) {
    const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.httpAddress);
      xhr.setRequestHeader('x-bt-token', temporalToken);
      xhr.setRequestHeader('Accept', '*/*');
      xhr.setRequestHeader('Accept-Language', 'en-us');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('User-Agent', 'okhttp/4.9.3');

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          this.log.info('Gate opened successfully!');
          this.log.debug('Response:', xhr.responseText);
          resolve();
        } else {
          this.log.error(`Error opening gate: ${xhr.status} - ${xhr.responseText}`);
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        this.log.error('Request failed! Unable to reach the API.');
        reject(new Error('Network error'));
      };

      xhr.send();
      this.log.debug('Gate opened');
    });
  }
}