let birthdays = [];
let editingIndex = null; // huidige regel die wordt bewerkt

// Laad de data vanaf backend
async function load() {
    const res = await fetch("/api/birthdays");
    birthdays = await res.json();
    render();
}

// Render de tabel
function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    const today = new Date();

    // helper: datum DD-MM-JJJJ
    function formatDateDDMMYYYY(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // helper: bereken leeftijd
    function calculateAge(birthDate) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthday =
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
        if (!hasHadBirthday) age--;
        return age;
    }

    // helper: bereken dagen tot volgende verjaardag
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
            // Edit-mode: invoervelden + Opslaan/Annuleer
            row.innerHTML = `
                <td><input id="edit-name" value="${b.name}"></td>
                <td><input id="edit-birthdate" type="date" value="${b.birthdate}"></td>
                <td>${age}</td>
                <td>${daysLeft}</td>
                <td><button onclick="saveEdit(${index})">Opslaan</button></td>
                <td><button onclick="cancelEdit()">Annuleer</button></td>
            `;
        } else {
            // Normale weergave + Bewerk/Verwijder
            row.innerHTML = `
                <td>${b.name}</td>
                <td>${formatDateDDMMYYYY(b.birthdate)}</td>
                <td>${age}</td>
                <td>${daysLeft}</td>
                <td><button onclick="editBirthday(${index})">Bewerk</button></td>
                <td><button onclick="removeBirthday(${index})">Verwijder</button></td>
            `;
        }

        tbody.appendChild(row);
    });
}

// Save data naar backend
async function save() {
    await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birthdays)
    });
}

// Voeg een nieuwe verjaardag toe
function addBirthday() {
    const nameInput = document.getElementById("name");
    const birthdateInput = document.getElementById("birthdate");
    const name = nameInput.value.trim();
    const birthdate = birthdateInput.value;

    if (!name || !birthdate) return;

    birthdays.push({ name, birthdate });
    save();
    render();

    // Velden leegmaken na toevoegen
    nameInput.value = "";
    birthdateInput.value = "";
}

// Verwijder verjaardag
function removeBirthday(index) {
    birthdays.splice(index, 1);
    save();
    render();
}

// Start bewerken
function editBirthday(index) {
    editingIndex = index;
    render();
}

// Annuleer bewerken
function cancelEdit() {
    editingIndex = null;
    render();
}

// Opslaan na bewerken
function saveEdit(index) {
    const name = document.getElementById("edit-name").value.trim();
    const birthdate = document.getElementById("edit-birthdate").value;
    if (!name || !birthdate) return;

    birthdays[index] = { name, birthdate };
    editingIndex = null;
    save();
    render();
}

// Init
load();
