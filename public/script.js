let birthdays = [];
let editingIndex = null;

async function load() {
    try {
        const res = await fetch("/api/birthdays");
        if (!res.ok) throw new Error("Kan data niet ophalen");
        birthdays = await res.json();
        render();
    } catch (err) {
        console.error("Fout bij laden verjaardagen:", err);
    }
}

function render() {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";
    const today = new Date();

    birthdays.sort((a,b)=>new Date(a.birthdate)-new Date(b.birthdate));

    function formatDateDDMMYYYY(dateStr){
        const d = new Date(dateStr);
        if(isNaN(d)) return dateStr;
        return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    }

    function ageAndDays(birthDate){
        let age = today.getFullYear()-birthDate.getFullYear();
        const hadBirthday = today.getMonth()>birthDate.getMonth() || 
                            (today.getMonth()===birthDate.getMonth() && today.getDate()>=birthDate.getDate());
        if(!hadBirthday) age--;
        let nextBD = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if(nextBD<today) nextBD.setFullYear(today.getFullYear()+1);
        const daysLeft = Math.ceil((nextBD-today)/(1000*60*60*24));
        return {age, daysLeft};
    }

    birthdays.forEach((b,index)=>{
        const bd = new Date(b.birthdate);
        if(isNaN(bd)) return;
        const {age, daysLeft}=ageAndDays(bd);
        const row=document.createElement("tr");
        if(editingIndex===index){
            row.innerHTML=`
                <td><input id="edit-name" value="${b.name}"></td>
                <td><input id="edit-birthdate" type="date" value="${b.birthdate}"></td>
                <td>${age}</td>
                <td>${daysLeft}</td>
                <td><button onclick="saveEdit(${index})">Opslaan</button></td>
                <td><button onclick="cancelEdit()">Annuleer</button></td>
            `;
        } else {
            row.innerHTML=`
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

async function save(){
    await fetch("/api/birthdays",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(birthdays)
    });
}

function addBirthday(){
    const name=document.getElementById("name").value.trim();
    const birthdate=document.getElementById("birthdate").value;
    if(!name||!birthdate) return;
    birthdays.push({name,birthdate});
    save();
    render();
    document.getElementById("name").value="";
    document.getElementById("birthdate").value="";
}

function removeBirthday(index){
    birthdays.splice(index,1);
    save();
    render();
}

function editBirthday(index){
    editingIndex=index;
    render();
}

function cancelEdit(){
    editingIndex=null;
    render();
}

function saveEdit(index){
    const name=document.getElementById("edit-name").value.trim();
    const birthdate=document.getElementById("edit-birthdate").value;
    if(!name||!birthdate) return;
    birthdays[index]={name,birthdate};
    editingIndex=null;
    save();
    render();
}

load();
