Module.register("MMM-MyBirthdays", {
    defaults: {
        updateInterval: 60 * 60 * 1000, // 1 uur
        showAge: true,
        maxItems: 5,
        jsonFile: "MyBirthdays.json"
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.birthdays = [];
        this.sendSocketNotification("CONFIG", this.config);
        this.updateDom();
    },

    getStyles: function () {
        return ["MMM-MyBirthdays.css"];
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BIRTHDAYS") {
            this.birthdays = payload;
            this.updateDom();
        }
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        if (!this.birthdays || this.birthdays.length === 0) {
            wrapper.innerHTML = "Geen geboortedagen gevonden";
            return wrapper;
        }

        const list = document.createElement("ul");
        list.className = "birthdays-list";

        const today = new Date();

        this.birthdays.slice(0, this.config.maxItems).forEach(person => {
            const li = document.createElement("li");
            li.className = "birthday-item";

            const birthDate = new Date(person.date);
            const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);

            let age = "";
            if (this.config.showAge) {
                const years = today.getFullYear() - birthDate.getFullYear();
                age = ` (${years + (nextBirthday < today ? 1 : 0)} jaar)`;
            }

            li.innerHTML = `${person.name}${age} - ${birthDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`;
            list.appendChild(li);
        });

        wrapper.appendChild(list);
        return wrapper;
    }
});
