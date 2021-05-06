#!/usr/bin/env python3
# -*- coding: utf-8 -*-

########################################################
#            PalGate Token Extraction Tool             #
########################################################
#                                                      #
# Like my work? please consider buying me a coffee :)  #
# https://paypal.me/roeio                              #
# Written by Roei Ofri                                 #
########################################################

import re
import requests

import constants

__author__ = "Roei Ofri"


class PalGateInfoExtractor:

    def __init__(self):
        self.client = requests.Session()
        self.client.headers = {'Content-Type': 'application/json'}
        self.sms_headers = {'x-bt-app-token': constants.SMS_TOKEN}
        self.sms_headers.update(self.client.headers)

    def initiate_sms(self, phone_number):
        # Initiating SMS request authorization
        self._validate_phone_prefix(phone_number)
        res = self.client.get(url=constants.SMS_ADDR.format(phone_number), headers=self.sms_headers)
        self._validate_res(res)
        return True

    def confirm_sms(self, confirm_code, phone_number):
        # Confirm SMS
        res = self.client.get(url=constants.VALIDATE_ADDR.format(phone_number, str(confirm_code)),
                              headers=self.sms_headers)
        self._validate_res(res)
        return res.json()['user']['token']

    def get_device_id(self, token):
        # Extract device ID (gate ID)
        res = self.client.get(url=constants.DEVICE_ADDR, headers={'x-bt-user-token': token})
        self._validate_res(res)
        return res.json()['devices']

    @staticmethod
    def _validate_res(res):
        print(res.json()['msg'])
        assert res.json()['status'] == 'ok', res.json()

    @staticmethod
    def _validate_phone_prefix(phone_number):
        assert len(phone_number) == 10, 'Phone number is too short/long, please check.'
        assert re.findall('^[0-9]*$', phone_number), 'Phone number should contain only digits'
        assert not re.findall('^[0-1]*$', phone_number[1:]), 'Phone number cannot start with 0 or 1.'

    def return_gate_info(self, res):
        ret_info = []
        for r in res:
            info_dict = {}
            for k, v in r.items():
                if k == 'address' or k == '_id':
                    info_dict[k] = v
            if info_dict:
                ret_info.append(info_dict)
        return ret_info


def main():
    palgate = PalGateInfoExtractor()
    phone_number = str(input('Please type your phone number, e.g 054123412345: '))
    assert palgate.initiate_sms(phone_number)
    sms_code = input('SMS was sent to your phone, please type SMS verification code: ')
    token = palgate.confirm_sms(sms_code, phone_number)
    devices = palgate.get_device_id(token)
    gate_info = palgate.return_gate_info(devices)
    print("--------------------------------------------------------------")
    print("          This is the extracted information:                  ")
    print("       Please save it for HomeBridge config usage             ")
    print("       Any issues? please open a ticket on github             ")
    print(" https://github.com/RoeiOfri/homebridge-palgate-opener/issues ")
    print("                                                              ")
    print("--------------------------------------------------------------")
    print("Disclaimer: this tool and the author are not responsible")
    print("for any issues/damage etc that might occur due to usage ")
    print("of this plugin. this plugin was written for teaching purposes only.")
    print("This tool and plugin are free and will always be free.")
    print("If you love this plugin and this tool and want to show your appreciation")
    print("please consider buying me a coffee :)")
    print("")
    print("-----------------------------------------------------------------")
    print("Info returns: [{<gate address>: <gate_id>}, <gate_address>: <gate_id>]")
    print("Gates ID and Address (location): {}".format(gate_info))
    print("-----------------------------------------------------------------------")
    print("Your token is (single token is needed for all gates): {}".format(token))
    print("-----------------------------------------------------------------------")
    print("")
    print("Donate -> https://paypal.me/roeio")
    print("Donate ->https://www.buymeacoffee.com/roeio                         ")


if __name__ == '__main__':
    main()
