const apiUrl = "/mybirthdays"; // via NodeHelper REST API

async function loadBirthdays() {
    const res = await fetch(apiUrl);
    const birthdays = await res.json();
    const tbody = document.querySelector("#birthdays-table tbody");
    tbody.innerHTML = "";
    birthdays.forEach((b, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${b.name}</td>
                        <td>${b.date}</td>
                        <td>
                            <button onclick="editBirthday(${index})">Edit</button>
                            <button onclick="deleteBirthday(${index})">Delete</button>
                        </td>`;
        tbody.appendChild(tr);
    });
}

document.querySelector("#birthday-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const index = document.getElementById("index").value;
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;

    const res = await fetch(apiUrl);
    const birthdays = await res.json();

    if (index === "") birthdays.push({name, date});
    else birthdays[index] = {name, date};

    await fetch(apiUrl, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(birthdays)
    });

    document.getElementById("birthday-form").reset();
    document.getElementById("index").value = "";
    loadBirthdays();
});

function editBirthday(i) {
    fetch(apiUrl).then(r => r.json()).then(birthdays => {
        document.getElementById("index").value = i;
        document.getElementById("name").value = birthdays[i].name;
        document.getElementById("date").value = birthdays[i].date;
    });
}

function deleteBirthday(i) {
    fetch(apiUrl).then(r => r.json()).then(async birthdays => {
        birthdays.splice(i,1);
        await fetch(apiUrl, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(birthdays)
        });
        loadBirthdays();
    });
}

document.getElementById("cancel").addEventListener("click", () => {
    document.getElementById("birthday-form").reset();
    document.getElementById("index").value = "";
});

loadBirthdays();
