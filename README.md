# homebridge-palgate-opener
PalGates homebridge plugin

This plugin enables connection between Pal Gate App Controled systems and Apple HomeKit.
Before installing the homebridge plugin you must extract the device ID to recieve a token.

# Extracting device ID and token
Please note: this tool was tested on MAC but it should work on any distribution.
Please note 2: Tool was written in Py2.7, please make sure you run it on py2.7.

From shell run:
`python extract_token.py` and follow on-screen instructions.

# Attention!
Obtaining token via the tool will cause Pal Gate token to be revoked hence it will no longer work for your
phone number until you will re-sign to the Pal Gate app which will cause the HomeKit token to be revoked.
