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
            try { return JSON.parse(fs.readFileSync(filePath)); } 
            catch (e) { console.error(`Error parsing translation file ${filePath}:`, e); }
        }

        const fallbackPath = path.join(this.translationsDir, "en.json");
        if (fs.existsSync(fallbackPath)) {
            try { return JSON.parse(fs.readFileSync(fallbackPath)); } 
            catch (e) { console.error("Error parsing English fallback translation:", e); }
        }

        return { B_Name:"Name", B_Age:"Age", B_Date:"Birthdate", B_Days:"Days" };
    },

    registerRoutes: function(){
        const app = this.expressApp;
        if(!app){
            console.error("Express app not found! Cannot register /mybirthdays route.");
            return;
        }

        app.use("/mybirthdays", require("express").static(path.join(__dirname, "public")));

        app.get("/mybirthdays", (req,res) => {
            res.sendFile(path.join(__dirname,"public","index.html"));
        });

        app.get("/api/birthdays", (req,res) => res.json(this.birthdays));

        app.post("/api/birthdays", (req,res) => {
            try {
                this.birthdays = req.body || [];
                fs.writeFileSync(this.birthdaysFile, JSON.stringify(this.birthdays,null,2));
                this.sendSocketNotification("BIRTHDAYS_LOADED", { birthdays: this.birthdays });
                res.json({ status: "ok" });
            } catch (e) {
                console.error("Error saving birthdays:", e);
                res.status(500).json({ status: "error", message: e.message });
            }
        });

        console.log("MMM-MyBirthdays routes registered at /mybirthdays");
    },

    socketNotificationReceived: function(notification, payload){
        if(notification==="LOAD_BIRTHDAYS"){
            const lang = payload?.language || "en";
            const translations = this.loadTranslations(lang);
            this.sendSocketNotification("BIRTHDAYS_LOADED", {
                birthdays: this.birthdays,
                translations: translations,
                language: lang
            });
        }
    }
});
