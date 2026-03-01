const API_BASE = "/mybirthdays/api/birthdays";

let birthdays = [];
let editingIndex = null;

async function load() {
    const res = await fetch(API_BASE);
    birthdays = await res.json();
    render();
}

async function save() {
    await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birthdays)
    });
}

function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";
    const today = new Date();

    function formatDateDDMMYYYY(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function calculateAge(birthDate) {
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;
        return age;
    }

    function calculateDaysLeft(birthDate) {
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
        return Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    }

    birthdays.forEach((b, index) => {
        const birthDate = new Date(b.birthdate);
        if (isNaN(birthDate)) return;

        const age = calculateAge(birthDate);
        const daysLeft = calculateDaysLeft(birthDate);

        const row = document.createElement("tr");

        if (editingIndex === index) {
            row.innerHTML = `
                <td><input id="edit-name" value="${b.name}"></td>
                <td><input id="edit-birthdate" type="date" value="${b.birthdate}"></td>
                <td>${age}</td>
                <td>${daysLeft}</td>
                <td><button onclick="saveEdit(${index})">Opslaan</button></td>
                <td><button onclick="cancelEdit()">Annuleer</button></td>
            `;
        } else {
            const daysDisplay = daysLeft === 0 ? "🎉 Vandaag!" : daysLeft;
            if (daysLeft <= 7) row.classList.add("upcoming");

            row.innerHTML = `
                <td>${b.name}</td>
                <td>${formatDateDDMMYYYY(b.birthdate)}</td>
                <td>${age}</td>
                <td>${daysDisplay}</td>
                <td><button onclick="editBirthday(${index})">Bewerk</button></td>
                <td><button onclick="removeBirthday(${index})">Verwijder</button></td>
            `;
        }

        tbody.appendChild(row);
    });
}

function addBirthday() {
    const name = document.getElementById("name").value.trim();
    const birthdate = document.getElementById("birthdate").value;
    if (!name || !birthdate) return;
    birthdays.push({ name, birthdate });
    save();
    render();
    document.getElementById("name").value = "";
    document.getElementById("birthdate").value = "";
}

function removeBirthday(index) {
    birthdays.splice(index, 1);
    save();
    render();
}

function editBirthday(index) {
    editingIndex = index;
    render();
}

function cancelEdit() {
    editingIndex = null;
    render();
}

function saveEdit(index) {
    const name = document.getElementById("edit-name").value.trim();
    const birthdate = document.getElementById("edit-birthdate").value;
    if (!name || !birthdate) return;
    birthdays[index] = { name, birthdate };
    editingIndex = null;
    save();
    render();
}

window.addEventListener("load", load);
