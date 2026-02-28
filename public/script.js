let birthdays = [];
let editingIndex = null; // index van regel die wordt bewerkt

async function load() {
    const res = await fetch("/api/birthdays");
    birthdays = await res.json();
    render();
}

function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    // helper functie voor DD-MM-JJJJ
    function formatDateDDMMYYYY(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    birthdays.forEach((b, index) => {
        const row = document.createElement("tr");

        if (editingIndex === index) {
            // invoervelden voor bewerken
            row.innerHTML = `
                <td><input id="edit-name" value="${b.name}"></td>
                <td><input id="edit-birthdate" type="date" value="${b.birthdate}"></td>
                <td><button onclick="saveEdit(${index})">Opslaan</button></td>
                <td><button onclick="cancelEdit()">Annuleer</button></td>
            `;
        } else {
            row.innerHTML = `
                <td>${b.name}</td>
                <td>${formatDateDDMMYYYY(b.birthdate)}</td>
                <td><button onclick="removeBirthday(${index})">Verwijder</button></td>
                <td><button onclick="editBirthday(${index})">Bewerk</button></td>
            `;
        }

        tbody.appendChild(row);
    });
}

async function save() {
    await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birthdays)
    });
}

function addBirthday() {
    const nameInput = document.getElementById("name");
    const birthdateInput = document.getElementById("birthdate");
    const name = nameInput.value.trim();
    const birthdate = birthdateInput.value;

    if (!name || !birthdate) return;

    birthdays.push({ name, birthdate });
    save();
    render();

    // Na toevoegen de velden leeg maken
    nameInput.value = "";
    birthdateInput.value = "";
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

load();
