const API_BASE = "/mybirthdays/api/birthdays";

let birthdays = [];
let filterText = "";

// Init
window.addEventListener("load", async () => {
    await load();

    document.getElementById("add-btn").addEventListener("click", addBirthday);

    const filterInput = document.getElementById("filter-input");

    // Live filter
    filterInput.addEventListener("input", e => {
        filterText = e.target.value.toLowerCase();
        render();
    });

    // Reset filter
    document.getElementById("reset-filter-btn").addEventListener("click", () => {
        filterText = "";
        filterInput.value = "";
        render();
    });
});

// ===== Load & Save =====
async function load() {
    try {
        const res = await fetch(API_BASE);
        birthdays = await res.json();
        sortBirthdays();
        render();
    } catch (err) {
        console.error("Fout bij laden verjaardagen:", err);
    }
}

async function save() {
    try {
        await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(birthdays)
        });
        sortBirthdays();
        render();
    } catch (err) {
        console.error("Fout bij opslaan:", err);
    }
}

// ===== Helpers =====
function calculateAge(birthDate, today) {
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;
    return age;
}

function getNextBirthday(birthDate) {
    const today = new Date();
    const next = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (
        next.getFullYear() === today.getFullYear() &&
        next.getMonth() === today.getMonth() &&
        next.getDate() === today.getDate()
    ) return next;
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return next;
}

function calculateDaysLeft(birthDate) {
    const today = new Date();
    const nextBD = getNextBirthday(birthDate);
    return Math.ceil((nextBD - today) / (1000 * 60 * 60 * 24));
}

// ===== Sorteren =====
function sortBirthdays() {
    birthdays.sort((a, b) => getNextBirthday(new Date(a.birthdate)) - getNextBirthday(new Date(b.birthdate)));
}

// ===== Render tabel =====
function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    birthdays.forEach((b, index) => {
        const birthDate = new Date(b.birthdate);
        if (isNaN(birthDate)) return;

        const age = calculateAge(birthDate);
        const daysLeft = calculateDaysLeft(birthDate);
        const isMatching = !filterText || b.name.toLowerCase().includes(filterText);

        const row = document.createElement("tr");

        if (daysLeft === 0) row.classList.add("today");
        else if (daysLeft <= 7) row.classList.add("upcoming");
        if (!isMatching) row.classList.add("not-matching");

        row.innerHTML = `
            <td><input class="edit-name" data-index="${index}" value="${b.name}"></td>
            <td><input type="date" class="edit-birthdate" data-index="${index}" value="${b.birthdate}"></td>
            <td>${birthDate.toLocaleDateString("nl-NL", { day: "2-digit", month: "long" })}</td>
            <td>${daysLeft === 0 ? "🎉 Vandaag!" : daysLeft}</td>
            <td><button class="remove-btn" data-index="${index}">Verwijder</button></td>
        `;

        tbody.appendChild(row);
    });

    // Event listeners inline edits
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
            const idx = btn.dataset.index;
            birthdays.splice(idx, 1);
            save();
        });
    });
}

// ===== Toevoegen =====
function addBirthday() {
    const nameInput = document.getElementById("name");
    const birthdateInput = document.getElementById("birthdate");

    const name = nameInput.value.trim();
    const birthdate = birthdateInput.value;
    if (!name || !birthdate) return;

    birthdays.push({ name, birthdate });
    nameInput.value = "";
    birthdateInput.value = "";

    sortBirthdays();
    save();
}
