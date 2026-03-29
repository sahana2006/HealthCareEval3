const records = [
  {
    initials: "NV",
    color: "#2d7a47",
    name: "Neil Verma",
    age: "35 Yrs",
    date: "Mar 5, 2025",
    note: "Patient presented with high blood pressure and dizziness. Prescribed Amlodipine. Referred to Physician.",
    prescription: "Amlodipine 5mg once daily for 30 days.",
    labs: ["Blood Pressure Monitoring", "Lipid Profile"],
    followup: "Apr 5, 2025",
  },
  {
    initials: "DP",
    color: "#7c3aed",
    name: "Dev Patel",
    age: "30 Male",
    date: "Mar 5, 2025",
    note: "Patient came for routine checkup.",
    prescription: "Vitamin D 1000IU daily.",
    labs: ["CBC", "Vitamin D"],
    followup: "Jun 5, 2025",
  },
  {
    initials: "NS",
    color: "#0891b2",
    name: "Nia Sharma",
    age: "45 F",
    date: "Mar 5, 2025",
    note: "Follow-up consultation for diabetes management.",
    prescription: "Metformin 500mg twice daily.",
    labs: ["HbA1c", "Fasting Blood Sugar"],
    followup: "Apr 1, 2025",
  },
];

function renderRecords() {
  const list = document.getElementById("recordsList");
  list.innerHTML = records
    .map(
      (record, index) => `
        <div class="record-item" onclick="openDetail(${index})">
          <div class="record-avatar" style="background:${record.color}">${record.initials}</div>
          <div class="record-info">
            <div class="r-name">${record.name} <span style="font-weight:400;color:var(--gray-400)">(${record.age})</span></div>
            <div class="r-note">${record.note}</div>
          </div>
          <div class="record-right">
            <div class="r-date">${record.date}</div>
            <button class="btn btn-outline btn-sm" onclick="openDetail(${index});event.stopPropagation()">View</button>
          </div>
        </div>
      `
    )
    .join("");
}

function openDetail(index) {
  const record = records[index];
  document.getElementById("dp-name").textContent = record.name;
  document.getElementById("dp-patient").textContent = `${record.name} (${record.age})`;
  document.getElementById("dp-date").textContent = record.date;
  document.getElementById("dp-notes").textContent = record.note;
  document.getElementById("dp-prescription").textContent = record.prescription;
  document.getElementById("dp-labs").innerHTML = record.labs.map((lab) => `<span class="tag">${lab}</span>`).join("");
  document.getElementById("dp-followup").textContent = record.followup;
  document.getElementById("detailPanel").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function closeDetail() {
  document.getElementById("detailPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

function openModal() {
  document.getElementById("createModal").classList.add("show");
}

function closeModal() {
  document.getElementById("createModal").classList.remove("show");
}

function saveNote() {
  const patient = document.getElementById("cn-patient").value;
  const notes = document.getElementById("cn-notes").value;
  const prescription = document.getElementById("cn-prescription").value;
  const lab = document.getElementById("cn-lab").value;
  const followup = document.getElementById("cn-followup").value;

  if (!patient || !notes) {
    alert("Please fill patient name and notes.");
    return;
  }

  const initials = patient
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colors = ["#2d7a47", "#7c3aed", "#0891b2", "#d97706", "#dc2626"];

  records.unshift({
    initials,
    color: colors[records.length % colors.length],
    name: patient,
    age: "--",
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    note: notes,
    prescription: prescription || "--",
    labs: lab ? [lab] : [],
    followup: followup || "--",
  });

  renderRecords();
  closeModal();
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderDoctorPortal("consultation");
  renderRecords();
});
