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
                const raw = fs.readFileSync(this.filePath);
                const parsed = JSON.parse(raw);

                if (Array.isArray(parsed)) {
                    // Sorteer alleen geldige items
                    this.data = parsed.filter(b => b.birthdate).sort((a, b) => {
                        const da = new Date(a.birthdate);
                        const db = new Date(b.birthdate);
                        if (isNaN(da)) return 1;
                        if (isNaN(db)) return -1;
                        return da - db;
                    });
                } else {
                    this.data = [];
                }

            } catch (e) {
                console.error("Fout bij laden MyBirthdays.json", e);
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

        app.use(express.json());

        // Root route serveert frontend
        const publicPath = path.join(__dirname, "public");
        app.get("/", (req, res) => {
            res.sendFile(path.join(publicPath, "index.html"));
        });

        // Statische bestanden
        app.use("/static", express.static(publicPath));

        // API endpoints
        app.get("/api/birthdays", (req, res) => {
            res.json(self.data);
        });

        app.post("/api/birthdays", (req, res) => {
            if (!Array.isArray(req.body)) return res.status(400).json({ error: "Ongeldige data" });

            self.data = req.body.filter(b => b.birthdate); // alleen geldige items
            self.data.sort((a, b) => {
                const da = new Date(a.birthdate);
                const db = new Date(b.birthdate);
                if (isNaN(da)) return 1;
                if (isNaN(db)) return -1;
                return da - db;
            });

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
