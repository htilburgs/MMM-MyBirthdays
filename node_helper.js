const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const express = require("express"); // Express nodig
const bodyParser = require("body-parser");

module.exports = NodeHelper.create({
    start() {
        console.log("MMM-MyBirthdays helper started...");
        this.birthdaysFile = path.join(__dirname, "MyBirthdays.json");
        this.birthdays = [];
        this.loadBirthdays();

        // Start Express server voor webfrontend
        this.startServer();
    },

    loadBirthdays() {
        fs.readFile(this.birthdaysFile, "utf8", (err, data) => {
            if (!err) {
                try {
                    this.birthdays = JSON.parse(data);
                    this.birthdays.sort((a, b) => new Date(a.date) - new Date(b.date));
                } catch (e) {
                    console.error("Error parsing birthdays:", e);
                    this.birthdays = [];
                }
            } else {
                this.birthdays = [];
            }
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.birthdays);
        });
    },

    saveBirthdays() {
        fs.writeFile(this.birthdaysFile, JSON.stringify(this.birthdays, null, 4), (err) => {
            if (err) console.error("Error saving birthdays:", err);
            this.loadBirthdays(); // Update MagicMirror frontend
        });
    },

    startServer() {
        const app = express();
        app.use(bodyParser.json());

        // GET alle verjaardagen
        app.get("/mybirthdays", (req, res) => {
            res.json(this.birthdays);
        });

        // PUT volledige lijst van verjaardagen (toevoegen/wijzigen/verwijderen)
        app.put("/mybirthdays", (req, res) => {
            const data = req.body;
            if (!Array.isArray(data)) return res.status(400).send("Invalid data format");
            this.birthdays = data;
            this.saveBirthdays();
            res.sendStatus(200);
        });

        // Start server op poort 8080 (zelfde als MagicMirror)
        this.server = app.listen(8080, () => {
            console.log("MMM-MyBirthdays REST API running on port 8080");
        });
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "LOAD_BIRTHDAYS") {
            this.loadBirthdays();
        }
    }
});
