let birthdays = [];

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
        row.innerHTML = `
            <td>${b.name}</td>
            <td>${b.birthdate}</td>
            <td><button onclick="removeBirthday(${index})">Verwijder</button></td>
        `;
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

load();
