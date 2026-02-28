Module.register("MMM-MyBirthdays", {
    defaults: {},

    start: function () {
        this.birthdays = [];
        this.sendSocketNotification("LOAD_BIRTHDAYS");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BIRTHDAYS_LOADED") {
            this.birthdays = payload;
            this.updateDom();
        }
    },

    getStyles: function () {
        return ["MyBirthdays.css"];
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

        this.birthdays.forEach(person => {
            const birthDate = new Date(person.birthdate);

            // leeftijd berekenen
            let age = today.getFullYear() - birthDate.getFullYear();
            const hasHadBirthday =
                (today.getMonth() > birthDate.getMonth()) ||
                (today.getMonth() === birthDate.getMonth() &&
                 today.getDate() >= birthDate.getDate());

            if (!hasHadBirthday) age--;

            // dagen tot verjaardag
            let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < today) {
                nextBirthday.setFullYear(today.getFullYear() + 1);
            }

            const diffTime = nextBirthday - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${person.name}</td>
                <td>${age}</td>
                <td>${person.birthdate}</td>
                <td>${daysLeft}</td>
            `;
            wrapper.appendChild(row);
        });

        return wrapper;
    }
});
