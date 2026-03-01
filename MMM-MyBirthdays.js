Module.register("MMM-MyBirthdays", {
    defaults: {},

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

        const header = document.createElement("tr");
        header.innerHTML = `
            <th>Naam</th>
            <th>Leeftijd</th>
            <th>Geboortedatum</th>
            <th>Dagen</th>
        `;
        wrapper.appendChild(header);

        const today = new Date();

        // UTC-fix: alleen jaar/maand/dag vergelijken
        function getNextBirthday(birthDate) {
            const next = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (
                next.getFullYear() === today.getFullYear() &&
                next.getMonth() === today.getMonth() &&
                next.getDate() === today.getDate()
            ) return next;
            if (next < today) next.setFullYear(today.getFullYear() + 1);
            return next;
        }

        // Sorteer op komende verjaardag
        const sorted = this.birthdays.slice().sort((a, b) => {
            return getNextBirthday(new Date(a.birthdate)) - getNextBirthday(new Date(b.birthdate));
        });

        sorted.forEach(person => {
            const birthDate = new Date(person.birthdate);
            if (isNaN(birthDate)) return;

            let age = today.getFullYear() - birthDate.getFullYear();
            if (
                today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
            ) age--;

            const nextBD = getNextBirthday(birthDate);
            const daysLeft = Math.ceil((nextBD - today) / (1000 * 60 * 60 * 24));

            const row = document.createElement("tr");
            if (daysLeft === 0) row.classList.add("today");
            else if (daysLeft <= 7) row.classList.add("upcoming");

            row.innerHTML = `
                <td>${person.name}</td>
                <td>${age}</td>
                <td>${birthDate.toLocaleDateString("nl-NL", { day: "2-digit", month: "long" })}</td>
                <td>${daysLeft === 0 ? "🎉 Vandaag!" : daysLeft}</td>
            `;
            wrapper.appendChild(row);
        });

        return wrapper;
    }
});
