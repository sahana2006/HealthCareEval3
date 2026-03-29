/* ============================================================
   WALKIN.JS — Walk-in Registration page logic
   ============================================================ */

let allPatients = [];

document.addEventListener('DOMContentLoaded', async () => {
  renderShell('walkin');

  const data = await loadData();
  if (!data) {
    showToast('Failed to load data.', 'error');
    return;
  }

  allPatients = data.patients;

  // --- Search functionality ---
  const searchInput = document.getElementById('patient-search');
  const searchResults = document.getElementById('search-results');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.classList.add('hidden');
      return;
    }

    const matches = allPatients.filter(p =>
      p.phone.includes(query) ||
      p.patientId.toLowerCase().includes(query) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-info"><span class="search-result-name">No patients found</span></div></div>';
    } else {
      searchResults.innerHTML = matches.map(p => `
        <div class="search-result-item" data-id="${p.id}">
          <div class="search-result-info">
            <span class="search-result-name">${p.firstName} ${p.lastName}</span>
            <span class="search-result-meta">${p.age} ${p.gender[0]} &bull; ${p.phone}</span>
          </div>
          <span class="search-result-id">${p.patientId}</span>
        </div>
      `).join('');

      // Click on result — fill form
      searchResults.querySelectorAll('.search-result-item[data-id]').forEach(item => {
        item.addEventListener('click', () => {
          const patient = allPatients.find(p => p.id === item.dataset.id);
          if (patient) fillForm(patient);
          searchResults.classList.add('hidden');
          searchInput.value = '';
        });
      });
    }

    searchResults.classList.remove('hidden');
  });

  // Hide results on outside click
  document.addEventListener('click', (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
      searchResults.classList.add('hidden');
    }
  });

  // --- Register button ---
  document.getElementById('register-btn').addEventListener('click', handleRegister);

  // --- Modal handlers ---
  document.getElementById('close-success-modal').addEventListener('click', closeModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-book-appointment').addEventListener('click', () => {
    closeModal();
    navigateTo('appointments');
  });
});

// --- Fill form with existing patient data ---
function fillForm(patient) {
  document.getElementById('first-name').value = patient.firstName;
  document.getElementById('last-name').value = patient.lastName;
  document.getElementById('email').value = patient.email;
  document.getElementById('phone').value = patient.phone;
  document.getElementById('dob').value = patient.dob;
  document.getElementById('gender').value = patient.gender;
  document.getElementById('blood-group').value = patient.bloodGroup;
  document.getElementById('guardian').value = patient.guardian || '';

  setSelectedPatient(patient);
  showToast(`Loaded patient: ${patient.firstName} ${patient.lastName}`);
}

// --- Validate and submit registration ---
function handleRegister() {
  const fields = [
    { id: 'first-name', errId: 'err-first-name', rules: { required: true } },
    { id: 'last-name', errId: 'err-last-name', rules: { required: true } },
    { id: 'email', errId: 'err-email', rules: { required: true, email: true } },
    { id: 'phone', errId: 'err-phone', rules: { required: true, phone: true } },
    { id: 'dob', errId: 'err-dob', rules: { required: true, dob: true } },
    { id: 'gender', errId: 'err-gender', rules: { required: true } },
    { id: 'blood-group', errId: 'err-blood-group', rules: { required: true } }
  ];

  let valid = true;
  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const errEl = document.getElementById(f.errId);
    if (!validateField(input, errEl, f.rules)) valid = false;
  });

  if (!valid) {
    showToast('Please fix the errors before submitting.', 'error');
    return;
  }

  // Build new patient object
  const newPatient = {
    id: 'P_NEW_' + Date.now(),
    patientId: 'S' + Math.floor(10000 + Math.random() * 90000),
    firstName: document.getElementById('first-name').value.trim(),
    lastName: document.getElementById('last-name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    dob: document.getElementById('dob').value.trim(),
    gender: document.getElementById('gender').value,
    bloodGroup: document.getElementById('blood-group').value,
    guardian: document.getElementById('guardian').value.trim(),
    age: calculateAge(document.getElementById('dob').value.trim())
  };

  // Save to session
  setSelectedPatient(newPatient);

  // Show success modal
  document.getElementById('modal-success-body').innerHTML = `
    <div class="modal-success-row"><span>Patient Name</span><span>${newPatient.firstName} ${newPatient.lastName}</span></div>
    <div class="modal-success-row"><span>Patient ID</span><span>${newPatient.patientId}</span></div>
    <div class="modal-success-row"><span>Age &amp; Gender</span><span>${newPatient.age} ${newPatient.gender}</span></div>
    <div class="modal-success-row"><span>Phone Number</span><span>${newPatient.phone}</span></div>
    <div class="modal-success-row"><span>Blood Group</span><span>${newPatient.bloodGroup}</span></div>
  `;
  document.getElementById('success-modal').classList.remove('hidden');

  // Clear form
  clearForm();
}

function clearForm() {
  ['first-name','last-name','email','phone','dob','guardian'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('gender').value = '';
  document.getElementById('blood-group').value = '';
  document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.input-field.error').forEach(el => el.classList.remove('error'));
}

function closeModal() {
  document.getElementById('success-modal').classList.add('hidden');
}

function calculateAge(dob) {
  if (!dob) return '';
  const [d, m, y] = dob.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
