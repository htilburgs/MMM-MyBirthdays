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
    position: "top_right", 
    config: {
        maxItems: 5,               // Maximum number of birthdays to display
        showColumnHeaders: true,   // Show table column headers (true) or hide them (false)
        language: null             // null = automatically use MagicMirror language
    }
}
```

