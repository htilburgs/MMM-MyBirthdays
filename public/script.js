const API_BASE = "/mybirthdays/api/birthdays";

let birthdays = [];

// Init: fetch data en event listener voor toevoegen
window.addEventListener("load", async () => {
    await load();
    document.getElementById("add-btn").addEventListener("click", addBirthday);
});

// ===== Load & Save =====
async function load() {
    try {
        const res = await fetch(API_BASE);
        birthdays = await res.json();
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
        render(); // Realtime update
    } catch (err) {
        console.error("Fout bij opslaan:", err);
    }
}

// ===== Render tabel =====
function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    const today = new Date();

    // Sorteer op eerstvolgende verjaardag
    const sorted = birthdays.slice().sort((a, b) => {
        function nextBD(dateStr) {
            const d = new Date(dateStr);
            let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
            if (next < today) next.setFullYear(today.getFullYear() + 1);
            return next;
        }
        return nextBD(a.birthdate) - nextBD(b.birthdate);
    });

    sorted.forEach((b, index) => {
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

// ===== Helpers =====
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
    save();
}
