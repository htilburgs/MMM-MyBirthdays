Module.register("MMM-MyBirthdays", {
    defaults: {
        maxItems: 5,
        showColumnHeaders: true,
        language: null // null = detect MagicMirror language
    },

    start: function () {
        this.birthdays = [];
        this.translations = { B_Name: "Name", B_Age: "Age", B_Date: "Birthdate", B_Days: "Days" };

        // Detect MagicMirror language
        const mmLang =
            (this.config.language && this.config.language.split("-")[0]) ||
            (window.config && window.config.language && window.config.language.split("-")[0]) ||
            "en";

        // Stuur altijd de gedetecteerde taal naar NodeHelper
        this.sendSocketNotification("LOAD_BIRTHDAYS", { language: mmLang });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BIRTHDAYS_LOADED") {
            this.birthdays = payload.birthdays || [];
            this.translations = payload.translations || this.translations;

            // Bewaar de taal van NodeHelper
            if (payload.language) this.config.language = payload.language;

            this.updateDom();
        }
    },

    getStyles: function () {
        return ["MMM-MyBirthdays.css"];
    },

    getDom: function () {
        const wrapper = document.createElement("table");
        wrapper.className = "birthdays-table";

        const today = new Date();
        const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        function getDaysLeft(birthDate) {
            let nextBD = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBD < todayMid) nextBD.setFullYear(today.getFullYear() + 1);
            return Math.round((nextBD - todayMid) / (1000 * 60 * 60 * 24));
        }

        // Sorteer op aankomende verjaardagen
        const sorted = this.birthdays
            .slice()
            .sort((a, b) => getDaysLeft(new Date(a.birthdate)) - getDaysLeft(new Date(b.birthdate)))
            .slice(0, this.config.maxItems);

        // Kolom headers
        if (this.config.showColumnHeaders) {
            const headerRow = document.createElement("tr");
            headerRow.innerHTML = `
                <th>${this.translations.B_Name}</th>
                <th>${this.translations.B_Age}</th>
                <th>${this.translations.B_Date}</th>
                <th>${this.translations.B_Days}</th>
            `;
            wrapper.appendChild(headerRow);
        }

        sorted.forEach((person, index) => {
            const birthDate = new Date(person.birthdate);
            if (isNaN(birthDate)) return;

            let age = today.getFullYear() - birthDate.getFullYear();
            if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;

            const daysLeft = getDaysLeft(birthDate);

            const row = document.createElement("tr");
            if (index === 0) row.classList.add("upcoming");

            row.innerHTML = `
                <td>${person.name}</td>
                <td>${age}</td>
                <td>${birthDate.toLocaleDateString(
                    this.config.language || "en",
                    { day: "2-digit", month: "long" }
                )}</td>
                <td>${daysLeft === 0 ? "🎂" : daysLeft}</td>
            `;
            wrapper.appendChild(row);
        });

        return wrapper;
    }
});
