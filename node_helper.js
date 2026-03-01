const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-MyBirthdays helper gestart");
        this.filePath = path.join(__dirname, "MyBirthdays.json");
        this.data = [];
        this.loadData();
        this.startWebServer();
    },

    loadData: function () {
        try {
            if (fs.existsSync(this.filePath)) {
                this.data = JSON.parse(fs.readFileSync(this.filePath));
            } else {
                this.data = [];
                fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
            }
        } catch (e) {
            console.error("Fout bij laden JSON:", e);
            this.data = [];
        }
    },

    startWebServer: function () {
        const app = this.expressApp;

        app.use(express.json());

        // Static bestanden
        app.use("/mybirthdays", express.static(path.join(__dirname, "public")));

        // Homepage
        app.get("/mybirthdays", (req, res) => {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        });

        // Data ophalen
        app.get("/mybirthdays/api/birthdays", (req, res) => {
            res.json(this.data);
        });

        // Data opslaan
        app.post("/mybirthdays/api/birthdays", (req, res) => {
            this.data = Array.isArray(req.body) ? req.body : [];
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));

            // realtime update mirror
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.data);

            res.json({ status: "ok" });
        });
    },

    socketNotificationReceived: function (notification) {
        if (notification === "LOAD_BIRTHDAYS") {
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.data);
        }
    }
});
