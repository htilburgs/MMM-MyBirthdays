Module.register("MMM-MyBirthdays", {
    defaults: {
        maxItems: 5,            // number of birthdays to display
        showColumnHeaders: true // show column headers
    },

    start: function () {
        this.birthdays = [];
        this.sendSocketNotification("LOAD_BIRTHDAYS");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BIRTHDAYS_LOADED") {
            this.birthdays = payload || [];
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

        // Helper: calculate days until next birthday
        function getDaysLeft(birthDate) {
            let nextBD = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBD < todayMid) nextBD.setFullYear(today.getFullYear() + 1);
            const diffTime = nextBD - todayMid;
            return Math.round(diffTime / (1000 * 60 * 60 * 24));
        }

        // Sort all birthdays by upcoming date
        const sorted = this.birthdays.slice().sort((a, b) => {
            const aDate = new Date(a.birthdate);
            const bDate = new Date(b.birthdate);
            return getDaysLeft(aDate) - getDaysLeft(bDate);
        });

        // Limit to maxItems
        const displayed = sorted.slice(0, this.config.maxItems);

        // Show column headers or not
        if (this.config.showColumnHeaders) {
            const header = document.createElement("tr");
            header.innerHTML = `
                <th>Name</th>
                <th>Age</th>
                <th>Birthdate</th>
                <th>Days</th>
            `;
            wrapper.appendChild(header);
        }

        displayed.forEach((person, index) => {
            const birthDate = new Date(person.birthdate);
            if (isNaN(birthDate)) return;

            let age = today.getFullYear() - birthDate.getFullYear();
            if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;

            const daysLeft = getDaysLeft(birthDate);

            const row = document.createElement("tr");

            // First row always gets .upcoming
            if (index === 0) {
                row.classList.add("upcoming");
            }

            row.innerHTML = `
                <td>${person.name}</td>
                <td>${age}</td>
                <td>${birthDate.toLocaleDateString("nl-NL", { day: "2-digit", month: "long" })}</td>
                <td>${daysLeft === 0 ? "🎂" : daysLeft}</td>
            `;
            wrapper.appendChild(row);
        });

        return wrapper;
    }
});
