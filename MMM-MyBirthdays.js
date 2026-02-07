Module.register("MMM-MyBirthdays", {
    defaults: {
        updateInterval: 60 * 60 * 1000, // 1 uur
        showAge: true,
        maxItems: 5,
        jsonFile: "MyBirthdays.json",
        filter: "all" // "all" of "upcomingMonth"
    },

    start() {
        Log.info("Starting module: " + this.name);
        this.birthdays = [];
        this.sendSocketNotification("MYBIRTHDAYS_CONFIG", this.config);
        this.updateDom();
    },

    getStyles() {
        return ["MMM-MyBirthdays.css"];
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "MYBIRTHDAYS_DATA") {
            this.birthdays = payload;
            this.updateDom();
        }
    },

    filterBirthdays(list) {
        if (this.config.filter === "upcomingMonth") {
            const today = new Date();
            return list.filter(b => {
                const date = new Date(b.date);
                const next = new Date(today.getFullYear(), date.getMonth(), date.getDate());
                if (next < today) next.setFullYear(today.getFullYear() + 1);
                return next.getMonth() === today.getMonth();
            });
        }
        return list;
    },

    getDom() {
        const wrapper = document.createElement("div");
        if (!this.birthdays || this.birthdays.length === 0) {
            wrapper.innerHTML = "Geen verjaardagen gevonden";
            return wrapper;
        }

        const list = document.createElement("ul");
        list.className = "birthdays-list";

        const today = new Date();
        const birthdaysToShow = this.filterBirthdays(this.birthdays).slice(0, this.config.maxItems);

        birthdaysToShow.forEach(person => {
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
