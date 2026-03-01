const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start() {
        console.log("MMM-MyBirthdays helper started...");
        this.birthdaysFile = path.join(__dirname, "MyBirthdays.json");
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "LOAD_BIRTHDAYS") {
            this.loadBirthdays();
        }
    },

    loadBirthdays() {
        fs.readFile(this.birthdaysFile, "utf8", (err, data) => {
            let birthdays = [];
            if (!err) {
                try {
                    birthdays = JSON.parse(data);
                    birthdays.sort((a, b) => new Date(a.date) - new Date(b.date));
                } catch (e) {
                    console.error("Error parsing birthdays:", e);
                }
            }
            this.sendSocketNotification("BIRTHDAYS_LOADED", birthdays);
        });
    },

    // HTTP endpoints voor webfrontend
    // Express wordt automatisch beschikbaar via node_helper
    socketNotificationReceived(notification, payload) {
        if (notification === "LOAD_BIRTHDAYS") {
            this.loadBirthdays();
        }
    },

    // REST API via Express
    startServer() {
        const self = this;
        if (!this.expressApp) return; // Express beschikbaar?
        this.expressApp.get("/mybirthdays", (req, res) => {
            fs.readFile(self.birthdaysFile, "utf8", (err, data) => {
                let birthdays = [];
                if (!err) {
                    try { birthdays = JSON.parse(data); } catch(e) {}
                }
                birthdays.sort((a,b) => new Date(a.date) - new Date(b.date));
                res.json(birthdays);
            });
        });

        this.expressApp.put("/mybirthdays", (req, res) => {
            const newData = req.body;
            if (!Array.isArray(newData)) return res.status(400).send("Invalid data");
            fs.writeFile(self.birthdaysFile, JSON.stringify(newData, null, 4), (err) => {
                if (err) return res.status(500).send("Error saving data");
                self.loadBirthdays(); // update module
                res.sendStatus(200);
            });
        });
    }
});
