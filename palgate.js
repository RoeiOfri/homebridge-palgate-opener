const { generateToken } = require('./token_generator.js');

module.exports = (api) => {
  api.registerAccessory('PalGateOpener', PalGateOpener);
};


class PalGateOpener {

  constructor(log, config, api) {
      this.log = log;
      this.config = config;
      this.api = api;

      //this.session = session;
      this.deviceId = config['deviceId'];
      this.token = config['token'];
      this.tokenType = config['tokenType'];
      this.phoneNumber = config['phoneNumber'];

      this.accessoryType = config['accessoryType'] || 'switch'
      this.name = config.name;
      this.accessoryType = this.accessoryType.toLowerCase()
      this.httpAddress = `https://api1.pal-es.com/v1/bt/device/${this.deviceId}/open-gate?outputNum=1`;

      this.Service = this.api.hap.Service;
      this.Characteristic = this.api.hap.Characteristic;
      this.log.debug('PalGate Accessory Plugin Loaded');
      this.log.debug("deviceID :", this.deviceId);
      this.log.debug("token :", this.token);
      this.log.debug("phoneNumber :", this.phoneNumber);

      // Verify accessory type meets supporting types.
      if (this.accessoryType != 'switch' && this.accessoryType != 'garagedoor') {
          this.log('Accessory Type is not supported, using it as "switch" instead!')
      }

      // AccessoryInformation service
      this.informationService = new this.api.hap.Service.AccessoryInformation()
          .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Pal Systems")
          .setCharacteristic(this.api.hap.Characteristic.Model, "PalGate App");

      // Deciding which button type to create (switch/garage door)
      switch(this.accessoryType) {
          case "switch":
              this.service = new this.api.hap.Service.Switch(this.name);
              this.service.getCharacteristic(this.api.hap.Characteristic.On)
                  .on('get', this.getOnHandler.bind(this))   // bind to getOnHandler method below
                  .on('set', this.setOnHandler.bind(this));  // bind to setOnHandler method below
          break

        case "garagedoor":
            this.service = new this.api.hap.Service.GarageDoorOpener(this.name)
            this.service.getCharacteristic(this.Characteristic.CurrentDoorState)
                .on('get', this.handleCurrentDoorStateGet.bind(this));

            this.service.getCharacteristic(this.Characteristic.TargetDoorState)
                .on('get', this.handleTargetDoorStateGet.bind(this))
                .on('set', this.handleTargetDoorStateSet.bind(this));
            break
      }
  }

 getServices() {
    return [this.informationService, this.service];
  }

  handleCurrentDoorStateGet(callback) {
    this.log.info('Triggered GET Current DoorState');
    var currentValue = this.api.hap.Characteristic.CurrentDoorState.CLOSED
    callback(null, currentValue);
  }

  handleTargetDoorStateGet(callback) {
    this.log.info('Triggered GET Target DoorState');
    var targetDoorState = this.api.hap.Characteristic.CurrentDoorState.CLOSED
    callback(null, targetDoorState);
  }

   // Handle request to open/close door
   handleTargetDoorStateSet(value, callback) {
    this.log.debug("Checking values before generating token...");
    this.log.debug("Token:", this.token);
    this.log.debug("Phone Number:", this.phoneNumber);

    if (!this.token || typeof this.token !== 'string' || !/^[0-9a-fA-F]{32}$/.test(this.token)) {
        this.log.error("Error: Token is missing or invalid.");
        return callback(new Error("Token is missing or invalid."));
    }

    if (!this.phoneNumber || isNaN(parseInt(this.phoneNumber, 10)) || this.phoneNumber.length !== 12) {
        this.log.error("Error: Phone number is missing or invalid.");
        return callback(new Error("Phone number is missing or invalid."));
    }

    try {
        var temporalToken = generateToken(Buffer.from(this.token, 'hex'), parseInt(this.phoneNumber, 10), this.tokenType);
        this.log.debug("Generated temp token:", temporalToken);
        if (value == this.api.hap.Characteristic.TargetDoorState.OPEN) {
          var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
          var xhr = new XMLHttpRequest();
          xhr.open('get', this.httpAddress);
          xhr.setRequestHeader('x-bt-token', temporalToken);
          xhr.setRequestHeader("Accept", "*/*");
          //xhr.setRequestHeader("Accept-Encoding", "gzip, deflate, br");
          xhr.setRequestHeader("Accept-Language", "en-us");
          //xhr.setRequestHeader("Connection", "keep-alive");
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.setRequestHeader("User-Agent", "okhttp/4.9.3");
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                this.log.info("Gate opened successfully!")
                this.log.debug("Response:", xhr.responseText);
                this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.api.hap.Characteristic.CurrentDoorState.OPEN);
            } else {
                this.log.error(`Error opening gate: ${xhr.status} - ${xhr.responseText}`);
            }
            };

            // ✅ Handle Errors
            xhr.onerror = () => {
                this.log.error("Request failed! Unable to reach the API.");
            };
          xhr.send();
          this.log.debug('Gate opened');
          this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.api.hap.Characteristic.CurrentDoorState.OPEN);
      } else if (value == this.api.hap.Characteristic.CurrentDoorState.CLOSED) {
          this.log.debug('Closing gate...');
          this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.api.hap.Characteristic.CurrentDoorState.CLOSED);
      }
  
      callback(null);
  
    } catch (error) {
        this.log.error("Error generating token:", error);
        return callback(error);
    }
  }

   

  getOnHandler(callback) {
      this.log.debug('Getting switch state');
      const value = false;
      callback(null, value);
  }

  setOnHandler(value, callback) {
      var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
      var xhr = new XMLHttpRequest();
      xhr.open('get', this.httpAddress);
      xhr.setRequestHeader('x-bt-user-token', this.token);
      xhr.send();
      this.log.info('Gate opened');
      callback(null);
    }
}
