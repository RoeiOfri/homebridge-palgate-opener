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

      this.Service = this.api.hap.Service;
      this.Characteristic = this.api.hap.Characteristic;
      this.log.debug('PalGate Accessory Plugin Loaded');

       // your accessory must have an AccessoryInformation service
      this.informationService = new this.api.hap.Service.AccessoryInformation()
        .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Pal Systems")
        .setCharacteristic(this.api.hap.Characteristic.Model, "PalGate App");

      // extract name from config
      this.name = config.name;

      // create a new Garage Door Opener service
      this.service = new this.api.hap.Service.GarageDoorOpener(this.name)

//       create handlers for required characteristics
      this.service.getCharacteristic(this.Characteristic.CurrentDoorState)
        .on('get', this.handleCurrentDoorStateGet.bind(this));

      this.service.getCharacteristic(this.Characteristic.TargetDoorState)
        .on('get', this.handleTargetDoorStateGet.bind(this))
        .on('set', this.handleTargetDoorStateSet.bind(this));

  }

/**
   * REQUIRED - This must return an array of the services you want to expose.
   * This method must be named "getServices".
   */
  getServices() {
    return [
      this.informationService,
      this.service,
    ];
  }

  /**
   * Handle requests to get the current value of the "Current Door State" characteristic
   */
  handleCurrentDoorStateGet(callback) {
    this.log.info('Triggered GET Current DoorState');
    var currentValue = Characteristic.CurrentDoorState.CLOSED
    callback(null, currentValue);
  }


  /**
   * Handle requests to get the current value of the "Target Door State" characteristic
   */
  handleTargetDoorStateGet(callback) {
    this.log.info('Triggered GET Target DoorState');
    var targetDoorState = Characteristic.CurrentDoorState.CLOSED
    callback(null, targetDoorState);
  }

   // Handle request to open/close door
  handleTargetDoorStateSet(value, callback) {
    if (value == Characteristic.TargetDoorState.OPEN) {
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        var httpaddr = `https://api1.pal-es.com/v1/bt/device/${this.deviceId}/open-gate?outputNum=1`;
        var htmlToken = this.token;
        xhr.open('get', httpaddr);
        xhr.setRequestHeader('x-bt-user-token', htmlToken);
        xhr.send();
        this.log.debug('Gate opened');
        this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN)
        // the first argument of the callback should be null if there are no errors
    } else if (value == Characteristic.CurrentDoorState.CLOSED) {
        this.log.debug('Closing gate...')
        this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    }
    callback(null)

  }
}

