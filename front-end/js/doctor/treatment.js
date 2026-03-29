let meds = [];
let selectedDur = "2 Weeks";

function addMed() {
  const input = document.getElementById("medInput");
  const value = input.value.trim();
  if (!value) return;

  meds.push(value);
  input.value = "";
  renderMeds();
}

function removeMed(index) {
  meds.splice(index, 1);
  renderMeds();
}

function renderMeds() {
  document.getElementById("medList").innerHTML = meds
    .map((med, index) => `<span class="removable-tag">${med}<button onclick="removeMed(${index})">&times;</button></span>`)
    .join("");

  const summary = document.getElementById("summaryMeds");
  if (meds.length === 0) {
    summary.innerHTML = '<span style="color:var(--gray-400)">No medications added yet.</span>';
    return;
  }

  summary.innerHTML = meds.map((med) => `<div class="med-item"><span class="dot"></span>${med}</div>`).join("");
}

function selectDur(element, value) {
  document.querySelectorAll(".dur-btn").forEach((button) => button.classList.remove("active"));
  element.classList.add("active");
  selectedDur = value;
  document.getElementById("planDur").textContent = value;
  document.getElementById("customDur").value = "";
}

function clearForm() {
  meds = [];
  renderMeds();
  document.getElementById("tests").value = "";
  document.getElementById("lifestyle").value = "";
  document.getElementById("diet").value = "";
  document.getElementById("customDur").value = "";
  document.getElementById("planDur").textContent = selectedDur;
}

function savePlan() {
  const tests = document.getElementById("tests").value;
  const lifestyle = document.getElementById("lifestyle").value;

  if (meds.length === 0 && !tests && !lifestyle) {
    alert("Please fill in at least one section of the treatment plan.");
    return;
  }

  alert("Treatment plan saved successfully!");
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderDoctorPortal("treatment");

  document.getElementById("planDate").textContent = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  document.getElementById("customDur").addEventListener("input", function () {
    if (this.value) {
      document.querySelectorAll(".dur-btn").forEach((button) => button.classList.remove("active"));
      document.getElementById("planDur").textContent = this.value;
    } else {
      document.getElementById("planDur").textContent = selectedDur;
    }
  });
});
