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
        this.registerRoutes();
    },

    loadBirthdays: function () {
        try {
            if (fs.existsSync(this.birthdaysFile)) {
                this.birthdays = JSON.parse(
                    fs.readFileSync(this.birthdaysFile, "utf8")
                );
            } else {
                fs.writeFileSync(this.birthdaysFile, JSON.stringify([], null, 2));
                this.birthdays = [];
            }
        } catch (e) {
            console.error("Error loading birthdays JSON:", e);
            this.birthdays = [];
        }
    },

    loadTranslations: function (lang) {
        const filePath = path.join(this.translationsDir, `${lang}.json`);
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath, "utf8"));
            } catch (e) {
                console.error(`Error parsing translation file ${filePath}:`, e);
            }
        }

        // fallback to English
        const fallbackPath = path.join(this.translationsDir, "en.json");
        if (fs.existsSync(fallbackPath)) {
            try {
                return JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
            } catch (e) {
                console.error("Error parsing English fallback translation:", e);
            }
        }

        return { B_Name: "Name", B_Age: "Age", B_Date: "Birthdate", B_Days: "Days" };
    },

    // Sort birthdays by next upcoming date
    getSortedBirthdays: function (list) {
        const today = new Date();

        const getNextBirthday = (dateStr) => {
            if (!dateStr) return new Date(8640000000000000);

            const parts = dateStr.split("-");
            if (parts.length !== 3) return new Date(8640000000000000);

            const [, month, day] = parts.map(Number);
            const next = new Date(today.getFullYear(), month - 1, day);

            if (next < today) {
                next.setFullYear(today.getFullYear() + 1);
            }
            return next;
        };

        return [...list].sort((a, b) => {
            return getNextBirthday(a.date) - getNextBirthday(b.date);
        });
    },

    registerRoutes: function () {
        const app = this.expressApp;
        if (!app) {
            console.error("Express app not found! Cannot register /mybirthdays route.");
            return;
        }

        // Enable JSON body parsing
        app.use(require("express").json());

        // Serve static files
        app.use("/mybirthdays", require("express").static(path.join(__dirname, "public")));

        // Homepage
        app.get("/mybirthdays", (req, res) => {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        });

        // API
        app.get("/api/birthdays", (req, res) => {
            res.json(this.getSortedBirthdays(this.birthdays));
        });

        app.post("/api/birthdays", (req, res) => {
            if (!Array.isArray(req.body)) {
                return res.status(400).json({ status: "error", message: "Invalid data" });
            }

            this.birthdays = req.body;
            fs.writeFileSync(
                this.birthdaysFile,
                JSON.stringify(this.birthdays, null, 2)
            );

            this.sendSocketNotification("BIRTHDAYS_LOADED", {
                birthdays: this.getSortedBirthdays(this.birthdays)
            });

            res.json({ status: "ok" });
        });

        console.log("MMM-MyBirthdays routes registered at /mybirthdays");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "LOAD_BIRTHDAYS") {
            // Multi-language auto detection
            let lang = "en";
            if (payload && payload.language) {
                lang = payload.language.split("-")[0];
            } else if (this.config && this.config.language) {
                lang = this.config.language.split("-")[0];
            }

            const translations = this.loadTranslations(lang);

            this.sendSocketNotification("BIRTHDAYS_LOADED", {
                birthdays: this.getSortedBirthdays(this.birthdays),
                translations: translations
            });
        }
    }
});
