# ATTENTION!!! #
Currently there's an authentication issue with the plugin due to a change Pal has made 
in the backend, new authentication flow is still under investigation!
If you have an old token it might stop working soon or already did stop working.
Currently there's no workaround.
If you think you can contribute for a solution please open an Issue in my repo.

# homebridge-palgate-opener
PalGates homebridge plugin

This plugin enables connection between Pal Gate App Controled systems and Apple HomeKit.
Before installing the homebridge plugin you must extract the device ID to recieve a token.

# Extract device ID and Token

## Extracting device ID and token from pi/linux/mac/windows
*Please note #1:* this tool was tested on MAC but it should work on any distribution.

*Please note #2:* Tool was written in Python 3.x, please make sure you run it with Python 3.x.

*Please note #3:* Make sure requests module is install in you venv/system (pip install requests)*


From shell run:
`python extract_token.py` and follow on-screen instructions.
make sure you have `requests` module installed before running the tool, if you don't know 
how to do that please [google it](https://letmegooglethat.com/?q=how+to+install+requests+module).

Via a container:
docker build . -t palgate-extract
docker run -it --rm palgate-extract

## Extracting device ID and Token from Homebridge Terminal
- Open homebridge via browser and login.
- Click on the three dots at the right side.
- Click on "Terminal".
- Once shell is opened type: `palgate_extract` and follow on-screen instructions.

### Extraction tool output example:
```
--------------------------------------------------------------
          This is the extracted information:
       Please save it for HomeBridge config usage
       Any issues? please open a ticket on github
 https://github.com/RoeiOfri/homebridge-palgate-opener/issues

--------------------------------------------------------------
Disclaimer: this tool and the author are not responsible
for any issues/damage etc that might occur due to usage
of this plugin. this plugin was written for teaching purposes only.
This tool and plugin are free and will always be free.
If you love this plugin and this tool and want to show your appreciation
please consider buying me a coffee :)

Donate -> https://paypal.me/roeio
Donate ->https://www.buymeacoffee.com/roeio
-----------------------------------------------------------------
 Info returns: {<gate address>: <gate_id>
Info: [{'_id': '3G00000001', 'address': 'עזריאלי', Tel Aviv-Yafo, Israel'}, 
       {'_id': '3G00000002', 'address': 'שרונה', Israel'}]
        ^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^^^^
           Your gate ID              Gate location
```
In this example we have two gates:
1. Gate ID: 3G00000001 located at 'עזריאלי', Tel Aviv-Yafo, Israel'.
2. Gate ID: 3G00000002 located at 'שרונה', Israel'. 

The address is for information purposes and is not needed.


# Plugin-in configuration

## Configure plugin via UI
1. Open your HomeBridge UI and navigate to "Plugins" tab.
2. Locate the PalGateOpener plugin and click on "Settings".
3. Follow on-screen instructions, please do so *after* extracting the gate-id and token using the extraction tool.

## Manual configuration (configuration.yaml file)
```
"accessories": [
        {
            "accessory": "PalGateOpener",
            "name": "<chosen name>",
            "accessoryType": "<garageDoor>"
            "deviceId": "<device_id>",
            "token": "<token>"
        },
        {
            "accessory": "PalGateOpener",
            "name": "<choosen name>",
            "accessoryType": "<switch>"
            "deviceId": "<device_id>",
            "token": "<token>"
        }
]
```
# Explanation
| key | Mandatory/Optional |Description |
| --- | --- | --- |
| `accessory` | Yes |Must be PalGateOpener |
| `name` |Yes |Chosen name to populate to HomeKit |
| `deviceId`|Yes | Gate ID extracted from CLI tool |
| `token` |Yes| Token extracted from CLI tool |
| `accessoryType`|No - Default usage: switch | switch/garageDoor* |
### Please note:
1. The default accessoryType is set to `switch`, if using `garageDoor` HomeKit with location service to open the gate
automatically when arriving home will have to be initiated by user via push notification and his approval for the automation to run.
This is a security feature by Apple.
If you wish to "bypass" it please set the `accessortyType` as `switch`.
2. You CAN duplicate the accessory so you will have one button as GarageDoor button and you will have the button also in your Apple CarPlay and a switch for the automation operation (works great BTW :))

2. When setting the `accessoryType` as `garageDoor` automation will not work independetly (as mentioned above) but you will loose the ability
to see the ability to use the Garage Door icon in Apple CarPlay.
If you wish that the gate will open automaticlly by setting location service automation please use `switch` as `accessoryType` value.

# Attention!
Obtaining token via the tool will cause Pal Gate phone APP token to be revoked hence it will no longer work for your
phone number (using the app) until you will re-sign to the Pal Gate app which will cause the HomeKit token to be revoked (thus HomeKit plugin will not work).

# FAQ
### Can I control more than one Pal Gate barriers?
Yes you can! just insert the block more than once with different name and with the same token and deviceID and it should work just fine.
### Will I still be able to use the PalGate app on my phone?
No, if you reopen the app you will be asked to re-authorize therefore the token obtained via CLI will get revoked and HomeKit will not be able communicate with the gate any more.
### Will I still be able to use voice-dial to open the gate?
Yes you can, it has nothing to do with this plugin.
### I re-signed to PalGate app and now I can't control the gate via HomeKit, what do I do?
Just re-run the tool, update the config file with the new token and you're good to go!

# Disclaimer
This plugin was created for my own personal use. I'm not affiliate by the company nor this plugin.
This plugin is self developed and is not related to Pal Gate Systems in any way.
I'm not responsible for any damage and/or data loss and/or any security breach etc etc caused by using this plugin.
Please use at your own risk and on your own responsibility.

# Like my work? consider buying me a coffee ;)
## https://paypal.me/roeio
## https://www.buymeacoffee.com/roeio
