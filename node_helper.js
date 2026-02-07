const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

module.exports = NodeHelper.create({
    start() {
        console.log(`Starting node helper for: ${this.name}`);
        this.config = {};
        this.birthdays = [];
        this.interval = null;

        // Express server
        this.app = express();
        this.app.use(bodyParser.json());
        this.port = 3123;

        // Serve static files vanuit public/
        this.app.use("/", express.static(path.join(__dirname, "public")));

        this.setupRoutes();

        this.server = this.app.listen(this.port, () => {
            console.log(`${this.name} web interface listening on port ${this.port}`);
        });
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "MYBIRTHDAYS_CONFIG") {
            this.config = payload;
            this.loadBirthdays();

            if (this.interval) clearInterval(this.interval);
            this.interval = setInterval(() => this.loadBirthdays(), this.config.updateInterval);
        }
    },

    getJsonPath() {
        return path.join(__dirname, this.config.jsonFile || "MyBirthdays.json");
    },

    // --- Lees verjaardagen en maak bestand aan als het ontbreekt ---
    loadBirthdays() {
        const jsonPath = this.getJsonPath();

        fs.readFile(jsonPath, "utf8", (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    console.log(`${this.name}: MyBirthdays.json bestaat niet, maak leeg bestand aan.`);
                    this.birthdays = [];
                    return this.saveBirthdays(true); // automatisch opslaan
                } else {
                    console.error(`${this.name}: Kan MyBirthdays.json niet lezen`, err);
                    this.birthdays = [];
                    this.sendSocketNotification("MYBIRTHDAYS_DATA", []);
                    return;
                }
            }

            try {
                this.birthdays = JSON.parse(data);
                if (!Array.isArray(this.birthdays)) throw new Error("JSON is geen array");
            } catch (e) {
                console.error(`${this.name}: Fout bij parsen van JSON, reset naar leeg array`, e);
                this.birthdays = [];
                return this.saveBirthdays(true); // corrigeer corrupt bestand
            }

            this.sortBirthdays();
            this.sendSocketNotification("MYBIRTHDAYS_DATA", this.birthdays);
        });
    },

    // --- Sla verjaardagen op ---
    saveBirthdays(skipNotification = false) {
        const jsonPath = this.getJsonPath();
        fs.writeFile(jsonPath, JSON.stringify(this.birthdays, null, 4), (err) => {
            if (err) {
                console.error(`${this.name}: Kan MyBirthdays.json niet opslaan`, err);
            } else {
                if (!skipNotification) this.sendSocketNotification("MYBIRTHDAYS_DATA", this.birthdays);
            }
        });
    },

    // --- Sorteer verjaardagen op eerstvolgende ---
    sortBirthdays() {
        const today = new Date();
        this.birthdays.sort((a, b) => {
            const dateA = new Date(a.date);
            const nextA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
            if (nextA < today) nextA.setFullYear(today.getFullYear() + 1);

            const dateB = new Date(b.date);
            const nextB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());
            if (nextB < today) nextB.setFullYear(today.getFullYear() + 1);

            return nextA - nextB;
        });
    },

    // --- API Routes voor webinterface ---
    setupRoutes() {
        // Haal alle verjaardagen op
        this.app.get("/birthdays", (req, res) => res.json(this.birthdays));

        // Voeg nieuwe verjaardag toe
        this.app.post("/birthdays", (req, res) => {
            const { name, date } = req.body;
            if (!name || !date) return res.status(400).json({ error: "name en date verplicht" });

            this.birthdays.push({ name, date });
            this.sortBirthdays();
            this.saveBirthdays();
            res.json({ success: true });
        });

        // Wijzig bestaande verjaardag
        this.app.put("/birthdays/:index", (req, res) => {
            const index = parseInt(req.params.index);
            const { name, date } = req.body;

            if (isNaN(index) || index < 0 || index >= this.birthdays.length) {
                return res.status(400).json({ error: "Ongeldige index" });
            }

            if (name) this.birthdays[index].name = name;
            if (date) this.birthdays[index].date = date;

            this.sortBirthdays();
            this.saveBirthdays();
            res.json({ success: true });
        });

        // Verwijder verjaardag
        this.app.delete("/birthdays/:index", (req, res) => {
            const index = parseInt(req.params.index);
            if (isNaN(index) || index < 0 || index >= this.birthdays.length) {
                return res.status(400).json({ error: "Ongeldige index" });
            }

            this.birthdays.splice(index, 1);
            this.saveBirthdays();
            res.json({ success: true });
        });
    }
});
