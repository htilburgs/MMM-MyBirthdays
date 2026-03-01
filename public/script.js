let birthdays = [];
let translations = {B_Name:"Name", B_Age:"Age", B_Date:"Birthdate", B_Days:"Days"};
let editingItemId = null;
let language = "en";

async function load() {
    const res = await fetch("/api/birthdays");
    birthdays = await res.json();
    language = document.documentElement.lang || "en";
    render();
}

function getDaysLeft(birthDate){
    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let nextBD = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if(nextBD < todayMid) nextBD.setFullYear(today.getFullYear()+1);
    return Math.round((nextBD - todayMid)/(1000*60*60*24));
}

function render(){
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    const tableHeader = document.getElementById("table-header");
    tableHeader.innerHTML = "";
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>${translations.B_Name}</th>
        <th>${translations.B_Age}</th>
        <th>${translations.B_Date}</th>
        <th>${translations.B_Days}</th>
        <th>Edit</th>
        <th>Actions</th>
    `;
    tableHeader.appendChild(headerRow);

    const today = new Date();
    const sorted = birthdays.slice().sort((a,b) => getDaysLeft(new Date(a.birthdate)) - getDaysLeft(new Date(b.birthdate)));

    sorted.forEach((b)=>{
        const birthDate = new Date(b.birthdate);
        if(isNaN(birthDate)) return;

        let age = today.getFullYear() - birthDate.getFullYear();
        if(today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;

        const daysLeft = getDaysLeft(birthDate);

        const row = document.createElement("tr");
        row.dataset.id = b.id || b.name+b.birthdate;

        // Highlight today’s birthday
        if(daysLeft === 0) row.classList.add("birthday-today");

        if(editingItemId === row.dataset.id){
            row.innerHTML = `
                <td><input id="edit-name" value="${b.name}"></td>
                <td>${age}</td>
                <td><input id="edit-birthdate" type="date" value="${b.birthdate}"></td>
                <td>${daysLeft===0?"🎂":daysLeft}</td>
                <td><button onclick="saveEdit('${row.dataset.id}')">Save</button></td>
                <td><button onclick="cancelEdit()">Cancel</button></td>
            `;
        } else {
            row.innerHTML = `
                <td>${b.name}</td>
                <td>${age}</td>
                <td>${birthDate.toLocaleDateString(language, { day:"2-digit", month:"long", year:"numeric" })}</td>
                <td>${daysLeft===0?"🎂":daysLeft}</td>
                <td><button onclick="editBirthday('${row.dataset.id}')">Edit</button></td>
                <td><button onclick="removeBirthday('${row.dataset.id}')">Delete</button></td>
            `;
        }
        tbody.appendChild(row);
    });
}

async function save(){
    try{
        await fetch("/api/birthdays", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(birthdays)
        });
    } catch(e){ console.error("Error saving birthdays:", e); }
}

function addBirthday(){
    const nameInput = document.getElementById("name");
    const birthdateInput = document.getElementById("birthdate");
    const name = nameInput.value.trim();
    const birthdate = birthdateInput.value;
    if(!name || !birthdate) return;

    birthdays.push({name, birthdate});
    save();
    load();
    nameInput.value = "";
    birthdateInput.value = "";
}

function removeBirthday(id){
    birthdays = birthdays.filter(b => (b.id || b.name+b.birthdate) !== id);
    save();
    render();
}

function editBirthday(id){
    editingItemId = id;
    render();
}

function cancelEdit(){
    editingItemId = null;
    render();
}

function saveEdit(id){
    const name = document.getElementById("edit-name").value.trim();
    const birthdate = document.getElementById("edit-birthdate").value;
    if(!name || !birthdate) return;

    birthdays = birthdays.map(b => (b.id||b.name+b.birthdate) === id ? {name,birthdate} : b);
    editingItemId = null;
    save();
    render();
}

function filterList(){
    const search = document.getElementById("search").value.toLowerCase();
    document.querySelectorAll("#list tr").forEach(row=>{
        if(row.dataset.id){
            const b = birthdays.find(b => (b.id||b.name+b.birthdate) === row.dataset.id);
            row.style.display = b.name.toLowerCase().includes(search) ? "" : "none";
        }
    });
}

load();
