const API_BASE = "/mybirthdays/api/birthdays";

let birthdays = [];

// Init: fetch en event listener toevoegen
window.addEventListener("load", async () => {
    await load();
    document.getElementById("add-btn").addEventListener("click", addBirthday);
});

// Load birthdays van backend
async function load() {
    const res = await fetch(API_BASE);
    birthdays = await res.json();
    render();
}

// Save birthdays naar backend
async function save() {
    await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birthdays)
    });
    render(); // realtime update
}

// Render de tabel
function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    const today = new Date();

    birthdays.forEach((b, index) => {
        const birthDate = new Date(b.birthdate);
        if (isNaN(birthDate)) return;

        const age = calculateAge(birthDate, today);
        const daysLeft = calculateDaysLeft(birthDate, today);
        const row = document.createElement("tr");

        let className = "";
        if (daysLeft === 0) className = "today";
        else if (daysLeft <= 7) className = "upcoming";

        row.className = className;

        row.innerHTML = `
            <td><input class="edit-name" data-index="${index}" value="${b.name}"></td>
            <td><input type="date" class="edit-birthdate" data-index="${index}" value="${b.birthdate}"></td>
            <td>${age}</td>
            <td>${daysLeft === 0 ? "🎉 Vandaag!" : daysLeft}</td>
            <td>
                <button class="remove-btn" data-index="${index}">Verwijder</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Event listeners voor inline edits
    document.querySelectorAll(".edit-name").forEach(input => {
        input.addEventListener("change", e => {
            const idx = e.target.dataset.index;
            birthdays[idx].name = e.target.value.trim();
            save();
        });
    });

    document.querySelectorAll(".edit-birthdate").forEach(input => {
        input.addEventListener("change", e => {
            const idx = e.target.dataset.index;
            birthdays[idx].birthdate = e.target.value;
            save();
        });
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const idx = e.target.dataset.index;
            birthdays.splice(idx, 1);
            save();
        });
    });
}

// Helpers
function calculateAge(birthDate, today) {
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;
    return age;
}

function calculateDaysLeft(birthDate, today) {
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    return Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
}

// Toevoegen
function addBirthday() {
    const nameInput = document.getElementById("name");
    const birthdateInput = document.getElementById("birthdate");
    const name = nameInput.value.trim();
    const birthdate = birthdateInput.value;
    if (!name || !birthdate) return;
    birthdays.push({ name, birthdate });
    nameInput.value = "";
    birthdateInput.value = "";
    save();
}
