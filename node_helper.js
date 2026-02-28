const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = NodeHelper.create({
    start: function () {
        this.data = [];
        this.filePath = path.join(this.path, "MyBirthdays.json");
        this.loadData();
    },

    loadData: function () {
        if (fs.existsSync(this.filePath)) {
            try {
                this.data = JSON.parse(fs.readFileSync(this.filePath));
                this.data.sort((a, b) => new Date(a.birthdate) - new Date(b.birthdate));
            } catch (e) {
                console.error("Fout bij het laden van MyBirthdays.json", e);
                this.data = [];
            }
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "LOAD_BIRTHDAYS") {
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.data);
        }
    },

    setExpressApp: function (app) {
        const self = this;

        // JSON parser middleware
        app.use(express.json());

        // Serve /public map
        app.use("/", express.static(path.join(this.path, "public")));

        // GET birthdays
        app.get("/api/birthdays", (req, res) => {
            res.json(self.data);
        });

        // POST birthdays
        app.post("/api/birthdays", (req, res) => {
            if (!Array.isArray(req.body)) {
                return res.status(400).json({ error: "Ongeldige data" });
            }

            self.data = req.body;
            self.data.sort((a, b) => new Date(a.birthdate) - new Date(b.birthdate));

            try {
                fs.writeFileSync(self.filePath, JSON.stringify(self.data, null, 2));
            } catch (e) {
                console.error("Fout bij opslaan MyBirthdays.json", e);
            }

            self.sendSocketNotification("BIRTHDAYS_LOADED", self.data);
            res.json({ status: "ok" });
        });
    }
});
