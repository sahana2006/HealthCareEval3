const ALL_TESTS = [
  { id: "cbc", name: "Complete Blood Count", cat: "Hematology" },
  { id: "lipid", name: "Lipid Profile", cat: "Biochemistry" },
  { id: "liver", name: "Liver Function Test", cat: "Biochemistry" },
  { id: "thyroid", name: "Thyroid Function Test", cat: "Endocrinology" },
  { id: "hba1c", name: "HbA1c", cat: "Diabetes" },
  { id: "vitd", name: "Vitamin D", cat: "Vitamins" },
  { id: "rft", name: "Renal Function Test", cat: "Nephrology" },
  { id: "ecg", name: "ECG", cat: "Cardiology" },
];

let selected = [];
let filtered = [...ALL_TESTS];

function filterTests(value) {
  filtered = ALL_TESTS.filter(
    (test) =>
      test.name.toLowerCase().includes(value.toLowerCase()) ||
      test.cat.toLowerCase().includes(value.toLowerCase())
  );
  renderCatalog();
}

function renderCatalog() {
  document.getElementById("testCatalog").innerHTML = filtered
    .map(
      (test) => `
        <div class="test-card ${selected.includes(test.id) ? "selected" : ""}" onclick="toggleTest('${test.id}')">
          <div class="t-name">${test.name}</div>
          <div class="t-cat">${test.cat}</div>
        </div>
      `
    )
    .join("");
}

function toggleTest(id) {
  if (selected.includes(id)) {
    selected = selected.filter((item) => item !== id);
  } else {
    selected.push(id);
  }

  renderCatalog();
  renderSelected();
}

function renderSelected() {
  document.getElementById("testCount").textContent = selected.length;
  document.getElementById("countLabel").textContent = selected.length;

  if (selected.length === 0) {
    document.getElementById("selectedTests").innerHTML = `
      <div class="empty-pkg">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18"/></svg>
        <p>No tests selected.<br>Click tests on the left to add.</p>
      </div>
    `;
    return;
  }

  document.getElementById("selectedTests").innerHTML = selected
    .map((id) => {
      const test = ALL_TESTS.find((item) => item.id === id);
      return `
        <div class="selected-test-item">
          <span>${test.name}</span>
          <button class="remove-btn" onclick="toggleTest('${id}')">&times;</button>
        </div>
      `;
    })
    .join("");
}

function assignPackage() {
  const name = document.getElementById("pkgName").value;
  if (!name) {
    alert("Please enter a package name.");
    return;
  }

  if (selected.length === 0) {
    alert("Please select at least one test.");
    return;
  }

  alert(`Package "${name}" with ${selected.length} tests assigned to patient!`);
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderDoctorPortal("labtest");
  renderCatalog();
  renderSelected();
});
