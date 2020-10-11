# homebridge-palgate-opener
PalGates homebridge plugin

This plugin enables connection between Pal Gate App Controled systems and Apple HomeKit.
Before installing the homebridge plugin you must extract the device ID to recieve a token.

# Extracting device ID and token
Please note: this tool was tested on MAC but it should work on any distribution.


Please note 2: Tool was written in Python 2.7, please make sure you run it on Python 2.7.

From shell run:
`python extract_token.py` and follow on-screen instructions.

# HomeBridge config file define
```
"accessories": [
        {
            "accessory": "PalGateOpener",
            "name": "<chosen name>",
            "deviceId": "<device_id",
            "token": "<token>"
        },
]
```
# Explination
| key | Description |
| --- | --- |
| `accessory` | Must be PalGateOpener |
| `name` | Chosen name to populate in HomeKit |
| `deviceId` | Gate ID extracted from CLI tool |
| `token` | Token extracted from CLI tool |

# Attention!
Obtaining token via the tool will cause Pal Gate token to be revoked hence it will no longer work for your
phone number until you will re-sign to the Pal Gate app which will cause the HomeKit token to be revoked.

# FAQ
### Can I control more than one Pal Gate barriers?
Currently no.
### Will I still be able to use the PalGate app on my phone?
No, if you reopen the app you will be asked to re-authorize therefore the token obtained via CLI will get revoked and HomeKit will not be able communicate with the gate any more.
### I re-signed to PalGate app and now I can't control the gate via HomeKit
Just re-run the tool, update the config file with the new token and you're good to go!

Like my work? consider buying me a coffee ;)
https://www.buymeacoffee.com/roeio
