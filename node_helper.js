const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "CONFIG") {
            this.config = payload;
            this.loadBirthdays();
            setInterval(() => {
                this.loadBirthdays();
            }, this.config.updateInterval);
        }
    },

    loadBirthdays: function () {
        const jsonPath = path.join(__dirname, this.config.jsonFile);

        fs.readFile(jsonPath, "utf8", (err, data) => {
            if (err) {
                console.error(this.name + ": Kan MyBirthdays.json niet lezen", err);
                this.sendSocketNotification("BIRTHDAYS", []);
                return;
            }

            let birthdays;
            try {
                birthdays = JSON.parse(data);
            } catch (e) {
                console.error(this.name + ": Fout bij parsen van JSON", e);
                this.sendSocketNotification("BIRTHDAYS", []);
                return;
            }

            const today = new Date();
            const sorted = birthdays.sort((a, b) => {
                const dateA = new Date(a.date);
                const nextA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
                if (nextA < today) nextA.setFullYear(today.getFullYear() + 1);

                const dateB = new Date(b.date);
                const nextB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());
                if (nextB < today) nextB.setFullYear(today.getFullYear() + 1);

                return nextA - nextB;
            });

            this.sendSocketNotification("BIRTHDAYS", sorted);
        });
    }
});
