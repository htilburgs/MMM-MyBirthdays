Module.register("MMM-MyBirthdays", {
    defaults: {
        language: null, // default: MagicMirror language
        updateInterval: 60 * 60 * 1000 // 1 hour
    },

    start() {
        this.loaded = false;
        this.birthdays = [];
        this.lang = this.config.language || config.language || 'en';
        this.sendSocketNotification("LOAD_BIRTHDAYS");
        setInterval(() => {
            this.sendSocketNotification("LOAD_BIRTHDAYS");
        }, this.config.updateInterval);
    },

    getTranslations() {
        return {
            en: "translations/en.json",
            nl: "translations/nl.json",
            de: "translations/de.json",
            fr: "translations/fr.json"
        };
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "BIRTHDAYS_LOADED") {
            this.birthdays = payload;
            this.loaded = true;
            this.updateDom();
        }
    },

    getDom() {
        const wrapper = document.createElement("div");
        if (!this.loaded) {
            wrapper.innerHTML = this.translate("LOADING");
            return wrapper;
        }

        const table = document.createElement("table");
        table.className = "birthdays-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["NAME","AGE","BIRTHDATE","DAYS_TO_BIRTHDAY"].forEach((key) => {
            const th = document.createElement("th");
            th.innerHTML = this.translate(key);
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const today = new Date();
        this.birthdays.forEach((b, index) => {
            const tr = document.createElement("tr");
            if (index === 0) tr.classList.add("upcoming");

            const nameTd = document.createElement("td");
            nameTd.innerHTML = b.name;
            tr.appendChild(nameTd);

            const ageTd = document.createElement("td");
            const birthDate = new Date(b.date);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            ageTd.innerHTML = age;
            tr.appendChild(ageTd);

            const dateTd = document.createElement("td");
            dateTd.innerHTML = birthDate.toLocaleDateString(this.lang);
            tr.appendChild(dateTd);

            const daysTd = document.createElement("td");
            let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < today) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
            const daysLeft = Math.ceil((nextBirthday - today)/(1000*60*60*24));
            daysTd.innerHTML = daysLeft;
            tr.appendChild(daysTd);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        return wrapper;
    }
});
