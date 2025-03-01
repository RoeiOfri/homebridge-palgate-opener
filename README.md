# Update #
This plugin has now been updated to work with the newest token and API flow for PalGate and works as of Feburary 2025. 

Credit to [@DonutByte](https://github.com/DonutByte) for making this possible. Translation from Python to Javascript was implemented by [@Knilo](https://github.com/Knilo).

# homebridge-palgate-opener
This plugin connects PalGate app-controlled systems to Apple HomeKit.

Before installing the plugin, gather the following information:
- **Device ID**: Found in the PalGate app under Gate > Settings.
- **Phone Number**: Your account’s phone number, including the country code (e.g., `972000000000` for a 12-digit Israeli number).
- **Session Token**: Extracted using the `pylgate` tool (see below).
- **Token Type**: Either `0` (SMS), `1` (Primary), or `2` (Secondary), determined via `pylgate` (see below).
# Using docker to extract the permanent session token (Dockerfile)
### Prerequistes:
Make sure you have `docker` running on your machine, if you don't know how to do that, google it.
##
Instead of the next section manual run, you can use the attached `Dockerfile` to install a docker image which will save you all the repo cloning etc, to do so run as follow:
1. From the this repo main folder run `docker build -t pylgate-runner .`
2. To execute the extraction tool please run `docker run -it pylgate-runner`
3. Scan the QR code using the Device Linking > Link a Device
4. The script will return an output like the following:
```
< SOME QR CODE WILL BE GENERATED HERE >
checking status...
updating user info...
checking derived token...
Logged-in successfully :)
Phone number (user id): <phone number>
Session token: <token>
Token type: 1 (TokenType.PRIMARY)
```
5. Copy this info to use in the config of the plugin.
* The QR code should be scanned within your PalGate app! to do so open your PalGate app, click on the menu icon (three lines).
* From the menu select "Device linking".
* Click on `Link a device` button.
* Scan the QR code generated above.

# Manually Extracting the Session Token and Token Type (Without Docker)
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
6. Copy this info to use in the config of the plugin.

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
| `phoneNumber` |Yes| Phone number for your account <972501234567> |
| `tokenType` |Yes| 1 (Primary) or 2 (Secondary) |
| `accessoryType`|No - Default usage: switch | switch/garageDoor* |

### Please note:
1. The default accessoryType is set to `switch`, if using `garageDoor` HomeKit with location service to open the gate
automatically when arriving home will have to be initiated by user via push notification and his approval for the automation to run.
This is a security feature by Apple.
If you wish to "bypass" it please set the `accessortyType` as `switch`.
2. You CAN duplicate the accessory so you will have one button as GarageDoor button in your Apple CarPlay and a switch for the automation scene (works great BTW :))

# FAQ
### Can I control more than one Pal Gate barriers?
Yes you can! just insert the block more than once with different name and with the same session token and a new deviceID and it should work just fine.
### Can I use both Garage accessory type and Switch?
Yes! just copy the same block of the device you want to duplicate and set the accessory type from `switch` to `garageDoor`.
### What's the difference between using the button as a `garageDoor` or `switch`?
If you use the tile as `garageDoor` YOU CANNOT run automations on it without approving it before run.
So if you want to have the button displayed in your Apple CarPlay but still want to run an automation that once you arrive home the gate will be opened automatically duplicate the same gate block with two different accessory types, one as `switch` which you can run automation on without prompting approval for it to run and one as `garageDoor` if you want to open it manually.
### Will I still be able to use the PalGate app on my phone?
Yes! With the Device Linking feature, adding this plugin using Pylgate does not remove access from your phone.
### Will I still be able to use voice-dial to open the gate?
Yes you can, it has nothing to do with this plugin.

# Disclaimer
This project is intended for research purpose only.

This project is not affiliated with, endorsed by, or in any way officially connected to PalGate.

The use of this software is at the user's own risk. The author(s) of this project take no responsibility and disclaim any liability for any damage, loss, or consequence resulting directly or indirectly from the use or application of this software.

Users are solely responsible for ensuring their use of this project complies with all applicable laws, regulations, and terms of service of any related platforms or services. The author(s) bear no accountability for any actions taken by users of this software.

# Feel free to star ⭐️ my repo.

## Like my work? consider buying me a coffee ;)
### https://paypal.me/roeio
### https://www.buymeacoffee.com/roeio
