const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-MyBirthdays helper started");

        this.birthdaysFile = path.join(__dirname, "MyBirthdays.json");
        this.translationsDir = path.join(__dirname, "translations");
        this.birthdays = [];

        this.loadBirthdays();
        this.startWebServer();
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

    saveBirthdays: function (data) {
        this.birthdays = data;
        try {
            fs.writeFileSync(this.birthdaysFile, JSON.stringify(this.birthdays, null, 2));
        } catch (e) {
            console.error("Error saving birthdays JSON:", e);
        }
    },

    loadTranslations: function (lang) {
        const filePath = path.join(this.translationsDir, `${lang}.json`);
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath));
            } catch (e) {
                console.error(`Error parsing ${filePath}:`, e);
            }
        }
        // fallback to English
        const fallbackPath = path.join(this.translationsDir, "en.json");
        if (fs.existsSync(fallbackPath)) {
            try {
                return JSON.parse(fs.readFileSync(fallbackPath));
            } catch (e) {
                console.error("Error parsing English fallback translation:", e);
            }
        }
        return { B_Name: "Name", B_Age: "Age", B_Date: "Birthdate", B_Days: "Days" };
    },

    startWebServer: function () {
        const app = express();
        app.use(express.json());
        app.use(express.static(path.join(__dirname, "public")));

        // Serve homepage
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        });

        // API: get birthdays
        app.get("/api/birthdays", (req, res) => {
            res.json(this.birthdays);
        });

        // API: save birthdays
        app.post("/api/birthdays", (req, res) => {
            const data = req.body;
            this.saveBirthdays(data);
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.birthdays);
            res.json({ status: "ok" });
        });

        const PORT = 8080;
        app.listen(PORT, () => console.log(`MMM-MyBirthdays webserver running on port ${PORT}`));
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "LOAD_BIRTHDAYS") {
            let lang = payload && payload.language ? payload.language : "en";
            const translations = this.loadTranslations(lang);
            this.sendSocketNotification("BIRTHDAYS_LOADED", {
                birthdays: this.birthdays,
                translations: translations,
                language: lang
            });
        }
    }
});
