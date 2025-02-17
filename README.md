# Update #
This plugin has now been updated to work with the newest token and API flow for PalGate and works as of Feburary 2025. 

Credit to @DonutByte for making this possible. Translation from Python to Javascript was implemented by @Knilo.

Currently the plugin only supports Garage Door mode.

# homebridge-palgate-opener
This plugin enables connection between Pal Gate App Controled systems and Apple HomeKit.

Before installing the homebridge plugin you must obtain the following info:
- Device ID: Obtained from the app. Go to Gate > Settings.
- Phone Number: This is the phone number of your account beginning with the country code and should be 12 digits long (eg 972000000000)
- Session Token: Extracted using pylgate (explained below)
- Token Type: 1 (Primary) or 2 (Secondary) and can be found using pylgate (explained below)

# Use pylgate to extract the Session Token and Token Type
@DonutByte released a Python tool for extracting the Session Token and Token Type.

1. Install the utility: `pip install git+https://github.com/DonutByte/pylgate.git@main`
2. Download the source code from [here](https://github.com/DonutByte/pylgate/releases)
3. Run the extraction script: `python pylgate/examples/generate_linked_device_session_token.py`
4. Scan the QR code using the Device Linking > Link a Device
5. The script will return an output like the following:
```
checking status...
pdating user info...
checking derived token...
Logged-in successfully :)
Phone number (user id): <phone number>
Session token: <token>
Token type: 1 (TokenType.PRIMARY)
```
7. Copy this info to use in the config of the plugin.

# Plugin-in configuration

## Configure plugin via UI
1. Open your HomeBridge UI and navigate to "Plugins" tab.
2. Locate the PalGateOpener plugin and click on "Settings".
3. Follow on-screen instructions, please do so *after* extracting the required information listed above.

## Manual configuration (configuration.yaml file)
```
"accessories": [
        {
            "accessory": "PalGateOpener",
            "name": "<chosen name>",
            "deviceId": "<device id>",
            "token": "<token>,
            "phoneNumber": "<phone number>",
            "tokenType": <1 or 2>,
            "accessoryType": "garageDoor"
        }
]
```
# Explanation
| key | Mandatory/Optional |Description |
| --- | --- | --- |
| `accessory` | Yes |Must be PalGateOpener |
| `name` |Yes |Chosen name to populate to HomeKit |
| `deviceId`|Yes | Gate ID extracted from CLI tool |
| `token` |Yes| Token extracted using pylgate |
| `phoneNumber` |Yes| Phone number for your account |
| `tokenType` |Yes| 1 (Primary) or 2 (Secondary) |
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


# FAQ
### Can I control more than one Pal Gate barriers?
Yes you can! just insert the block more than once with different name and with the same token and deviceID and it should work just fine.
### Will I still be able to use the PalGate app on my phone?
Yes! With the Device Linking feature, adding this plugin using Pylgate does not remove access from your phone.
### Will I still be able to use voice-dial to open the gate?
Yes you can, it has nothing to do with this plugin.

# Disclaimer
This project is intended for research purpose only.

This project is not affiliated with, endorsed by, or in any way officially connected to PalGate.

The use of this software is at the user's own risk. The author(s) of this project take no responsibility and disclaim any liability for any damage, loss, or consequence resulting directly or indirectly from the use or application of this software.

Users are solely responsible for ensuring their use of this project complies with all applicable laws, regulations, and terms of service of any related platforms or services. The author(s) bear no accountability for any actions taken by users of this software.


# Like my work? consider buying me a coffee ;)
## https://paypal.me/roeio
## https://www.buymeacoffee.com/roeio
