module.exports = (api) => {
  api.registerAccessory('PalGateOpener', PalGateOpener);
};


class PalGateOpener {

  constructor(log, config, api) {
      this.log = log;
      this.config = config;
      this.api = api;
      this.deviceId = config['deviceId'];
      this.token = config['token'];
      this.accessoryType = config['accessoryType'] || 'switch'
      this.name = config.name;
      this.accessoryType = this.accessoryType.toLowerCase()
      this.httpAddress = `https://api1.pal-es.com/v1/bt/device/${this.deviceId}/open-gate?outputNum=1`;

      this.Service = this.api.hap.Service;
      this.Characteristic = this.api.hap.Characteristic;
      this.log.debug('PalGate Accessory Plugin Loaded');

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
    if (value == this.api.hap.Characteristic.TargetDoorState.OPEN) {
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        xhr.open('get', this.httpAddress);
        xhr.setRequestHeader('x-bt-user-token', this.token);
        xhr.send();
        this.log.debug('Gate opened');
        this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.api.hap.Characteristic.CurrentDoorState.OPEN)
    } else if (value == Characteristic.CurrentDoorState.CLOSED) {
        this.log.debug('Closing gate...')
        this.service.setCharacteristic(this.Characteristic.CurrentDoorState, this.api.hap.Characteristic.CurrentDoorState.CLOSED);
    }
    callback(null)
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