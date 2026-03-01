const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-MyBirthdays helper started");

        this.birthdaysFile = path.join(__dirname, "MyBirthdays.json");
        this.translationsDir = path.join(__dirname, "translations");
        this.birthdays = [];

        this.loadBirthdays();
    },

    loadBirthdays: function () {
        try {
            if (fs.existsSync(this.birthdaysFile)) {
                this.birthdays = JSON.parse(fs.readFileSync(this.birthdaysFile));
            } else {
                fs.writeFileSync(this.birthdaysFile, JSON.stringify([], null, 2));
                this.birthdays = [];
            }
        } catch (e) {
            console.error("Error loading birthdays JSON:", e);
            this.birthdays = [];
        }
    },

    loadTranslations: function(lang) {
        const filePath = path.join(this.translationsDir, `${lang}.json`);
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath));
            } catch (e) {
                console.error(`Error parsing translation file ${filePath}:`, e);
            }
        }

        // fallback to English if requested language file doesn't exist
        const fallbackPath = path.join(this.translationsDir, "en.json");
        if (fs.existsSync(fallbackPath)) {
            try {
                return JSON.parse(fs.readFileSync(fallbackPath));
            } catch (e) {
                console.error("Error parsing English fallback translation:", e);
            }
        }

        // Minimal translations if no JSON found
        return { B_Name:"Name", B_Age:"Age", B_Date:"Birthdate", B_Days:"Days" };
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "LOAD_BIRTHDAYS") {
            const lang = payload && payload.language ? payload.language : "en";
            const translations = this.loadTranslations(lang);

            this.sendSocketNotification("BIRTHDAYS_LOADED", {
                birthdays: this.birthdays,
                translations: translations,
                language: lang
            });
        }
    }
});
