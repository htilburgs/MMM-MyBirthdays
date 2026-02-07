const apiBase = "http://localhost:3123";

async function fetchBirthdays() {
    const res = await fetch(`${apiBase}/birthdays`);
    const data = await res.json();
    const tbody = document.querySelector("#birthdayTable tbody");
    tbody.innerHTML = "";
    data.forEach((b, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" value="${b.name}" id="name-${index}"></td>
            <td><input type="date" value="${b.date}" id="date-${index}"></td>
            <td>
                <button onclick="updateBirthday(${index})">Wijzigen</button>
                <button onclick="deleteBirthday(${index})">Verwijderen</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function updateBirthday(index) {
    const name = document.getElementById(`name-${index}`).value;
    const date = document.getElementById(`date-${index}`).value;
    await fetch(`${apiBase}/birthdays/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date })
    });
    fetchBirthdays();
}

async function deleteBirthday(index) {
    await fetch(`${apiBase}/birthdays/${index}`, { method: "DELETE" });
    fetchBirthdays();
}

document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("newName").value;
    const date = document.getElementById("newDate").value;
    await fetch(`${apiBase}/birthdays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date })
    });
    document.getElementById("newName").value = "";
    document.getElementById("newDate").value = "";
    fetchBirthdays();
});

fetchBirthdays();
