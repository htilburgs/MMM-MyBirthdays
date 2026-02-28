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

    birthdays.forEach((b, index) => {
        const row = document.createElement("tr");

        if (editingIndex === index) {
            // Toon invoervelden voor bewerken
            row.innerHTML = `
                <td><input id="edit-name" value="${b.name}"></td>
                <td><input id="edit-birthdate" type="date" value="${b.birthdate}"></td>
                <td><button onclick="saveEdit(${index})">Opslaan</button></td>
                <td><button onclick="cancelEdit()">Annuleer</button></td>
            `;
        } else {
            // Normale weergave
            row.innerHTML = `
                <td>${b.name}</td>
                <td>${b.birthdate}</td>
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
    const name = document.getElementById("name").value;
    const birthdate = document.getElementById("birthdate").value;
    if (!name || !birthdate) return;
    birthdays.push({ name, birthdate });
    save();
    render();
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
    const name = document.getElementById("edit-name").value;
    const birthdate = document.getElementById("edit-birthdate").value;
    if (!name || !birthdate) return;

    birthdays[index] = { name, birthdate };
    editingIndex = null;
    save();
    render();
}

load();
