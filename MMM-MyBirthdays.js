Module.register("MMM-MyBirthdays", {
    defaults: {},

    start: function () {
        this.birthdays = [];
        // Initial load
        this.sendSocketNotification("LOAD_BIRTHDAYS");
    },

    socketNotificationReceived: function (notification, payload) {
        console.log("Socket notification received:", notification, payload);
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

        // helper functie dd-mmmm
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            if (isNaN(date)) return dateStr;
            return date.toLocaleDateString("nl-NL", { day: "2-digit", month: "long" });
        }

        this.birthdays.forEach(person => {
            const birthDate = new Date(person.birthdate);

            if (isNaN(birthDate)) return; // skip invalid dates

            // Leeftijd berekenen
            let age = today.getFullYear() - birthDate.getFullYear();
            const hasHadBirthday =
                (today.getMonth() > birthDate.getMonth()) ||
                (today.getMonth() === birthDate.getMonth() &&
                 today.getDate() >= birthDate.getDate());
            if (!hasHadBirthday) age--;

            // Dagen tot verjaardag
            let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);

            const diffTime = nextBirthday - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${person.name}</td>
                <td>${age}</td>
                <td>${formatDate(person.birthdate)}</td>
                <td>${daysLeft}</td>
            `;
            wrapper.appendChild(row);
        });

        return wrapper;
    }
});
