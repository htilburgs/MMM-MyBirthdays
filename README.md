# MMM-MyBirthdays
This a [MagicMirror²](https://github.com/MichMich/MagicMirror) module for showing upcomming birthdays.

IMAGE

## Installation
Clone this repository in your modules folder, and install dependencies:

```
cd ~/MagicMirror/modules 
git clone https://github.com/htilburgs/MMM-MyBirthdays.git
cd MMM-MyBirthdays
npm install 
```

## Update
When you need to update this module:

```
cd ~/MagicMirror/modules/MMM-MyBirthdays
git pull
npm install
```

## Configuration
Go to the MagicMirror/config directory and edit the config.js file.
Add the module to your modules array in your config.js.

```
  {
        module: "MMM-MyBirthdays",
        position: "top_right", // pas aan naar wens: top_left, bottom_right, etc.
        header: "MyBirthdays",
        disabled: false,
        config: {
                  updateInterval: 60 * 60 * 1000,         // update elke 1 uur
                  fadeSpeed: 1000,                        // fade-in snelheid in ms
                  jsonFile: "MyBirthdays.json",           // JSON file path
                  filter: "all",                          // "all" or "upcomingMonth"
                  maxItems: 5,
                  showColumnHeaders: true,
                  showDaysLeft: true,
                }
  },
```

