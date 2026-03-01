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
        const app = express();
        app.use(express.json());
        app.use(express.static(path.join(__dirname, "public")));

        app.get("/mybirthdays", (req, res) => {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        });

        app.get("/mybirthdays/api/birthdays", (req, res) => {
            res.json(this.data);
        });

        app.post("/mybirthdays/api/birthdays", (req, res) => {
            this.data = req.body;
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.data);
            res.json({ status: "ok" });
        });

        const port = 3123;
        app.listen(port, () => {
            console.log(`MMM-MyBirthdays webserver op poort ${port}`);
        });
    },

    socketNotificationReceived: function (notification) {
        if (notification === "LOAD_BIRTHDAYS") {
            this.sendSocketNotification("BIRTHDAYS_LOADED", this.data);
        }
    }
});
