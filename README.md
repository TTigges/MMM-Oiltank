# MMM-Oiltank
This an extension for the [MagicMirror](https://github.com/MichMich/MagicMirror). It is a product of [this thread](https://forum.magicmirror.builders/topic/6486/show-integer-logs-from-python-script-as-diagram-in-mm/). It is intended to be used with a JSON that is updated daily to report on the tank volume.
## Installation
Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/TTigges/MMM-FullsizeCover`.
## Dependencies
This module reads a JSON with the tank volume.
````javascript
[{"Date":"2018-02-04","Volumen":2500},{"Date":"2018-02-04","Volumen":2490}]
````
The module catches the value of the key "Volumen". (To Do: Key can be set in the config.)
## Using the module
Add the module to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-Oiltank',
		config: {
			file: "http://192.168.0.123/yourfile.json" // only works with http: at the moment, doesn't work with localhost
		}
	}

]
````
## Configuration options

The following properties can be configured:

| Option                       | Description
| ---------------------------- | -----------
| `file`                       | **Example:** `http://192.168.0.123/yourfile.json` <br><br> **Note:** At the moment this only works with http request. For local files, use the commented lines 37 - 39 in the node_helper.js
| `warnVolume`                 | Shows a red line indicating the set amount of liters as integer. <br><br> **Example:** `500` – will show the line at 500 liters<br> **Default value:** `0` – the line will not be visible when set to 0.
| `showDays`                   | Defines the timeframe for the chart. <br><br> **Default:** `30` <br><br> **Note:** When the list has less results, it will only show these.
| `scope`                      | Defines the scale of the volume steps (together with the size of the steps themselves) and how much below and above the min and max volume is shown. <br><br> **Default:** `25`

## Developer Notes
This module is still work in progress.
## To Do
 - Label, for example: Dates from the JSON
 - `prediction: true/false` – showing a prediction of when the volume hits the warning line
 - oil tank icon for the volume
 - show the max. tank capacity?
 - The warning line should only show when it's within the scope
 - check different width for the chart
 - detect local files, request vs. fs

The MIT License (MIT)
=====================

Copyright © 2018 TTigges

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
