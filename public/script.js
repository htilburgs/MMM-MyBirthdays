let birthdays = [];
let translations = {};
let language = "en";
let editingIndex = null;
let maxItems = 5;
let showColumnHeaders = true;

// Load birthdays and translations from backend
async function load() {
    const res = await fetch("/api/birthdays");
    birthdays = await res.json();

    // Try to get language and translations from backend
    try {
        const socketRes = await fetch("/api/birthdays"); // dummy, real socket would provide translations
        // here we simulate backend providing translations
        // in real MMM, the translations come via BIRTHDAYS_LOADED
        translations = {
            B_Name: "Name",
            B_Age: "Age",
            B_Date: "Birthdate",
            B_Days: "Days"
        };
    } catch {
        translations = {
            B_Name: "Name",
            B_Age: "Age",
            B_Date: "Birthdate",
            B_Days: "Days"
        };
    }

    render();
}

// Render table with translations and language
function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    const tableHeader = document.getElementById("table-header");
    tableHeader.innerHTML = "";
    if (showColumnHeaders) {
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
    }

    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    function getDaysLeft(birthDate) {
        let nextBD = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if(nextBD < todayMid) nextBD.setFullYear(today.getFullYear()+1);
        return Math.round((nextBD - todayMid)/(1000*60*60*24));
    }

    birthdays.sort((a,b)=> getDaysLeft(new Date(a.birthdate)) - getDaysLeft(new Date(b.birthdate)));
    const displayed = birthdays.slice(0, maxItems);

    displayed.forEach((b,index)=>{
        const birthDate = new Date(b.birthdate);
        if(isNaN(birthDate)) return;

        let age = today.getFullYear() - birthDate.getFullYear();
        if(today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;

        const daysLeft = getDaysLeft(birthDate);
        const row = document.createElement("tr");
        if(index===0) row.classList.add("upcoming");

        if(editingIndex===index){
            row.innerHTML = `
                <td><input id="edit-name" value="${b.name}"></td>
                <td>${age}</td>
                <td><input id="edit-birthdate" type="date" value="${b.birthdate}"></td>
                <td>${daysLeft===0?"🎂":daysLeft}</td>
                <td><button onclick="saveEdit(${index})">Save</button></td>
                <td><button onclick="cancelEdit()">Cancel</button></td>
            `;
        } else {
            row.innerHTML = `
                <td>${b.name}</td>
                <td>${age}</td>
                <td>${birthDate.toLocaleDateString(language || "en", { day:"2-digit", month:"long" })}</td>
                <td>${daysLeft===0?"🎂":daysLeft}</td>
                <td><button onclick="editBirthday(${index})">Edit</button></td>
                <td><button onclick="removeBirthday(${index})">Delete</button></td>
            `;
        }
        tbody.appendChild(row);
    });
}

// Save birthdays
async function save() {
    await fetch("/api/birthdays", {
        method:"POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(birthdays)
    });
}

// Add birthday
function addBirthday() {
    const nameInput = document.getElementById("name");
    const birthdateInput = document.getElementById("birthdate");
    const name = nameInput.value.trim();
    const birthdate = birthdateInput.value;
    if(!name || !birthdate) return;

    birthdays.push({name,birthdate});
    birthdays.sort((a,b)=> new Date(a.birthdate) - new Date(b.birthdate));
    save();
    render();
    nameInput.value = "";
    birthdateInput.value = "";
}

// Remove birthday
function removeBirthday(index){
    birthdays.splice(index,1);
    save();
    render();
}

// Edit birthday
function editBirthday(index){
    editingIndex = index;
    render();
}

// Cancel edit
function cancelEdit(){
    editingIndex = null;
    render();
}

// Save edit
function saveEdit(index){
    const name = document.getElementById("edit-name").value.trim();
    const birthdate = document.getElementById("edit-birthdate").value;
    if(!name || !birthdate) return;

    birthdays[index] = {name,birthdate};
    editingIndex = null;
    save();
    render();
}

// Filter table
function filterList(){
    const search = document.getElementById("search").value.toLowerCase();
    birthdays.forEach((b,i)=>{
        const row = document.getElementById("list").children[i];
        if(!row) return;
        const match = b.name.toLowerCase().includes(search);
        row.style.display = match ? "" : "none";
    });
}

// Init
load();
