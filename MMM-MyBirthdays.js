Module.register("MMM-MyBirthdays", {
    defaults: {
        maxItems: 5,
        showColumnHeaders: true,
        language: null // null = gebruik MM-taal
    },

    start: function() {
        this.birthdays = [];
        this.translations = { B_Name: "Name", B_Age: "Age", B_Date: "Birthdate", B_Days: "Days" };

        // Gebruik module taal als ingesteld, anders MM taal, anders fallback naar Engels
        this.lang = this.config.language || (window.config?.language) || "en";

        // Vraag helper om verjaardagen en vertalingen
        this.sendSocketNotification("LOAD_BIRTHDAYS", { language: this.lang });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "BIRTHDAYS_LOADED") {
            this.birthdays = payload.birthdays || [];
            this.translations = payload.translations || this.translations;

            // Alleen update de taal als module taal null is (dus overnemen van helper/MM)
            if (!this.config.language) this.lang = payload.language || this.lang;

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

        // Sorteer verjaardagen op aankomend
        const sorted = this.birthdays.slice().sort(
            (a, b) => getDaysLeft(new Date(a.birthdate)) - getDaysLeft(new Date(b.birthdate))
        );
        const displayed = sorted.slice(0, this.config.maxItems);

        // Kolomkoppen
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

        // Render verjaardagen
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
