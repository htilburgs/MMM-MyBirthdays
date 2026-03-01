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
        this.registerExpressRoutes();
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

    // Koppel routes aan bestaande MagicMirror Express server
    registerExpressRoutes: function () {
        const app = this.expressApp || express(); // gebruik MagicMirror expressApp als beschikbaar
        app.use(express.json());

        // Statics uit /public
        app.use("/mybirthdays", express.static(path.join(__dirname, "public")));

        // Homepage
        app.get("/mybirthdays", (req, res) => {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        });

        // API routes
        app.get("/mybirthdays/api/birthdays", (req, res) => {
            res.json(this.data);
        });

        app.post("/mybirthdays/api/birthdays", (req, res) => {
            this.data = req.body;
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.data);
            res.json({ status: "ok" });
        });

        console.log("MMM-MyBirthdays routes geregistreerd op bestaande server (8080)");
    },

    socketNotificationReceived: function (notification) {
        if (notification === "LOAD_BIRTHDAYS") {
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.data);
        }
    }
});
