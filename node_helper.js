const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
        this.data = [];
        this.filePath = path.join(this.path, "MyBirthdays.json");

        // Laad bestaande data
        this.loadData();
    },

    loadData: function () {
        if (fs.existsSync(this.filePath)) {
            try {
                this.data = JSON.parse(fs.readFileSync(this.filePath));
                // Sorteer op geboortedatum
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

    // Express server voor frontend
    setExpressApp: function (app) {
        const self = this;

        // GET /api/birthdays → frontend haalt op
        app.get("/api/birthdays", (req, res) => {
            res.json(self.data);
        });

        // POST /api/birthdays → frontend slaat op
        app.post("/api/birthdays", (req, res) => {
            if (!Array.isArray(req.body)) {
                return res.status(400).json({ error: "Ongeldige data" });
            }

            self.data = req.body;

            // Sorteer data op geboortedatum
            self.data.sort((a, b) => new Date(a.birthdate) - new Date(b.birthdate));

            // Opslaan naar JSON
            try {
                fs.writeFileSync(self.filePath, JSON.stringify(self.data, null, 2));
            } catch (e) {
                console.error("Fout bij opslaan MyBirthdays.json", e);
            }

            // Notificatie naar MagicMirror-module
            self.sendSocketNotification("BIRTHDAYS_LOADED", self.data);

            res.json({ status: "ok" });
        });
    }
});
