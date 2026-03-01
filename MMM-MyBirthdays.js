Module.register("MMM-MyBirthdays", {
    defaults: {
        maxItems: 5,
        showColumnHeaders: true,
        language: null // null = use MagicMirror language
    },

    start: function() {
        this.birthdays = [];
        this.translations = { B_Name: "Name", B_Age: "Age", B_Date: "Birthdate", B_Days: "Days" };

        // Resolve language: module override or MagicMirror language
        this.lang = this.config.language || (window.config?.language) || "en";

        // Load birthdays and translations from helper
        this.sendSocketNotification("LOAD_BIRTHDAYS", { language: this.lang });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "BIRTHDAYS_LOADED") {
            this.birthdays = payload.birthdays || [];
            this.translations = payload.translations || this.translations;

            // Update language in case the helper sends it
            if (!this.config.language) {
                this.lang = payload.language || this.lang;
            }

            this.updateDom();
        }
    },

    getStyles: function() {
        return ["MMM-MyBirthdays.css"];
    },

    getDom: function() {
        const wrapper = document.createElement("table");
        wrapper.className = "birthdays-table";

        const today = new Date();
        const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        function getDaysLeft(birthDate) {
            let nextBD = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBD < todayMid) nextBD.setFullYear(today.getFullYear() + 1);
            return Math.round((nextBD - todayMid) / (1000 * 60 * 60 * 24));
        }

        // Sort birthdays by upcoming
        const sorted = this.birthdays.slice().sort(
            (a, b) => getDaysLeft(new Date(a.birthdate)) - getDaysLeft(new Date(b.birthdate))
        );
        const displayed = sorted.slice(0, this.config.maxItems);

        // Column headers
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

        // Render birthdays
        displayed.forEach((person, index) => {
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
                <td>${birthDate.toLocaleDateString(this.lang, { day: "2-digit", month: "long" })}</td>
                <td>${daysLeft === 0 ? "🎂" : daysLeft}</td>
            `;
            wrapper.appendChild(row);
        });

        return wrapper;
    }
});
