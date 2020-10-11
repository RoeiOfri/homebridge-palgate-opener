import requests

import constants


class PalGateInfoExtractor:

    def __init__(self):
        self.phone_number = str(raw_input('Please type your phone number, e.g 054123412345: '))
        self.phone_number = self.phone_number[1:]
        headers = {'Content-Type': 'application/json'}
        self.sms_headers = {'x-bt-app-token': constants.SMS_TOKEN}
        self.sms_headers.update(headers)
        self.client = requests.Session()
        self.client.headers = headers
        self.token = ''
        self.device_id = ''
        self.get_sms()

    def get_sms(self):
        # Initiating SMS request authorization
        res = self.client.get(url=constants.SMS_ADDR.format(self.phone_number), headers=self.sms_headers)
        self._validate_res(res)
        sms_code = input('SMS was sent to your phone, please type SMS verification code: ')
        self.confirm_sms(sms_code=sms_code)

    def confirm_sms(self, sms_code):
        # Confirm SMS
        res = self.client.get(url=constants.VALIDATE_ADDR.format(self.phone_number, str(sms_code)), headers=self.sms_headers)
        self._validate_res(res)
        self.token = res.json()['user']['token']
        print ('This is your token, please save it!\n {}'.format(self.token))
        self.get_device_id(token=self.token)

    def get_device_id(self, token):
        # Extract device ID (gate ID)
        res = self.client.get(url=constants.DEVICE_ADDR, headers={'x-bt-user-token': token})
        self._validate_res(res)
        device_id = [device['id'] for device in res.json()['devices']]
        if len(device_id) > 1:
            print 'Multiple gate controls not yet supported.'
        else:
            self.device_id = device
        print('This is your device ID: {}'.format(device_id[0]))
        self.final()

    def final(self):
        print "--------------------------------------------------------------"
        print "          This is the extracted information:                  "
        print "       Please save it for HomeBridge config usage             "
        print "       Any issues? please open a ticket on github             "
        print " https://github.com/RoeiOfri/homebridge-palgate-opener/issues "
        print "                                                              "
        print "--------------------------------------------------------------"
        print "Disclaimer: this tool and the author are not responsible"
        print "for any issues/damage etc that might occur due to usage "
        print "of this plugin. this plugin was written for teaching purposes only."
        print "This tool and plugin are free and will always be free."
        print "If you love this plugin and this tool and want to show your appreciation"
        print "please consider buying me a coffee :)"
        print ""
        print "https://www.buymeacoffee.com/roeio                               "
        print "-----------------------------------------------------------------"
        print "Device ID: {}".format(self.device_id)
        print "Token: {}".format(self.token)

    def _validate_res(self, res):
        print res.json()['msg']
        assert res.json()['status'] == 'ok', res.json()


def main():
    PalGateInfoExtractor()


if __name__ == '__main__':
    main()
