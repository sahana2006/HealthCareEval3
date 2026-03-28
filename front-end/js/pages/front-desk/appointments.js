/* ============================================================
   APPOINTMENTS.JS — Appointment Management multi-step flow
   ============================================================ */

let appData = null;
let allPatients = [];
let allDoctors = [];
let allSpecialties = [];
let selectedSpecialty = null;
let selectedDoctor = null;
let selectedSlot = null;
let selectedDate = null;
let currentDateOffset = 0;
let pendingCancelId = null;
let appointments = [];

document.addEventListener('DOMContentLoaded', async () => {
  renderShell('appointments');

  appData = await loadData();
  if (!appData) {
    showToast('Failed to load data.', 'error');
    return;
  }

  allPatients = appData.patients;
  allDoctors = appData.doctors;
  allSpecialties = appData.specialties;
  appointments = [...appData.appointments];

  // Restore selected patient from session if any
  const savedPatient = getSelectedPatient();
  if (savedPatient) showSelectedPatient(savedPatient);

  // Render upcoming consultations
  renderUpcomingConsultations();

  // Patient search
  setupPatientSearch();

  // New Appointment button
  document.getElementById('new-appointment-btn').addEventListener('click', () => {
    goToStep('specialty');
    renderSpecialties(allSpecialties);
  });

  // Back buttons
  document.getElementById('back-to-patient-btn').addEventListener('click', () => goToStep('patient'));
  document.getElementById('back-to-specialty-btn').addEventListener('click', () => goToStep('specialty'));
  document.getElementById('back-to-doctor-btn').addEventListener('click', () => goToStep('doctor'));

  // Specialty search
  document.getElementById('specialty-search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const filtered = allSpecialties.filter(s => s.name.toLowerCase().includes(q));
    renderSpecialties(filtered);
  });

  // Doctor search
  document.getElementById('doctor-search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    if (!selectedSpecialty) return;
    const docs = allDoctors.filter(d =>
      d.specialtyId === selectedSpecialty.id &&
      d.name.toLowerCase().includes(q)
    );
    renderDoctors(docs);
  });

  // Date navigation
  document.getElementById('prev-dates-btn').addEventListener('click', () => {
    if (currentDateOffset > 0) { currentDateOffset--; renderDateStrip(); }
  });
  document.getElementById('next-dates-btn').addEventListener('click', () => {
    currentDateOffset++;
    renderDateStrip();
  });

  // Confirm appointment
  document.getElementById('confirm-appointment-btn').addEventListener('click', confirmAppointment);

  // Modal close handlers
  document.getElementById('close-modify-modal').addEventListener('click', () => {
    document.getElementById('modify-modal').classList.add('hidden');
  });
  document.getElementById('cancel-modify-btn').addEventListener('click', () => {
    document.getElementById('modify-modal').classList.add('hidden');
  });
  document.getElementById('close-cancel-modal').addEventListener('click', () => {
    document.getElementById('cancel-modal').classList.add('hidden');
  });
  document.getElementById('abort-cancel-btn').addEventListener('click', () => {
    document.getElementById('cancel-modal').classList.add('hidden');
  });
  document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
    if (pendingCancelId) {
      appointments = appointments.filter(a => a.id !== pendingCancelId);
      renderUpcomingConsultations();
      document.getElementById('cancel-modal').classList.add('hidden');
      showToast('Appointment cancelled successfully.');
      pendingCancelId = null;
    }
  });
  document.getElementById('save-modify-btn').addEventListener('click', () => {
    document.getElementById('modify-modal').classList.add('hidden');
    showToast('Appointment updated successfully.');
  });
});

// --- Go to specific step ---
function goToStep(step) {
  document.querySelectorAll('.appt-step').forEach(el => el.classList.add('hidden'));
  document.getElementById(`step-${step}`).classList.remove('hidden');
}

// --- Patient Search ---
function setupPatientSearch() {
  const input = document.getElementById('appt-patient-search');
  const results = document.getElementById('appt-search-results');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.classList.add('hidden'); return; }

    const matches = allPatients.filter(p =>
      p.phone.includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q)
    );

    if (!matches.length) {
      results.innerHTML = '<div class="search-result-item"><div class="search-result-info"><span class="search-result-name">No patients found</span></div></div>';
    } else {
      results.innerHTML = matches.map(p => `
        <div class="search-result-item" data-id="${p.id}">
          <div class="search-result-info">
            <span class="search-result-name">${p.firstName} ${p.lastName}</span>
            <span class="search-result-meta">${p.age}${p.gender[0]} &bull; ${p.phone}</span>
          </div>
          <span class="search-result-id">${p.patientId}</span>
        </div>
      `).join('');
      results.querySelectorAll('.search-result-item[data-id]').forEach(item => {
        item.addEventListener('click', () => {
          const patient = allPatients.find(p => p.id === item.dataset.id);
          if (patient) {
            setSelectedPatient(patient);
            showSelectedPatient(patient);
            results.classList.add('hidden');
            input.value = '';
          }
        });
      });
    }
    results.classList.remove('hidden');
  });

  document.addEventListener('click', e => {
    if (!results.contains(e.target) && e.target !== input) results.classList.add('hidden');
  });
}

function showSelectedPatient(patient) {
  const badge = document.getElementById('selected-patient-badge');
  document.getElementById('selected-patient-name').textContent =
    `${patient.firstName} ${patient.lastName} — ${patient.patientId}`;
  badge.classList.remove('hidden');

  document.getElementById('clear-patient-btn').onclick = () => {
    setSelectedPatient(null);
    badge.classList.add('hidden');
  };
}

// --- Render Upcoming Consultations ---
function renderUpcomingConsultations() {
  const container = document.getElementById('upcoming-consultations');
  if (!appointments.length) {
    container.innerHTML = '<div class="empty-state"><p>No upcoming consultations</p></div>';
    return;
  }
  container.innerHTML = appointments.slice(0, 5).map(a => `
    <div class="consultation-item">
      <div class="consultation-info">
        <span class="consultation-patient">${a.patientName} - ${a.patientAge}${a.patientGender}</span>
        <span class="consultation-meta">${a.doctorName} - ${a.time}</span>
      </div>
      <div class="consultation-actions">
        <button class="btn btn-modify btn-sm modify-btn" data-id="${a.id}">Modify</button>
        <button class="btn btn-danger btn-sm cancel-btn" data-id="${a.id}">Cancel</button>
      </div>
    </div>
  `).join('');

  // Bind modify/cancel
  container.querySelectorAll('.modify-btn').forEach(btn => {
    btn.addEventListener('click', () => openModifyModal(btn.dataset.id));
  });
  container.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => openCancelModal(btn.dataset.id));
  });
}

// --- Render Specialties ---
function renderSpecialties(specs) {
  const grid = document.getElementById('specialty-grid');
  if (!specs.length) {
    grid.innerHTML = '<div class="empty-state"><p>No specialties found</p></div>';
    return;
  }
  grid.innerHTML = specs.map(s => `
    <div class="specialty-card" data-id="${s.id}" data-name="${s.name}">
      <div class="specialty-icon">${getSpecialtyIcon(s.icon)}</div>
      <span class="specialty-name">${s.name}</span>
    </div>
  `).join('');

  grid.querySelectorAll('.specialty-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedSpecialty = allSpecialties.find(s => s.id === card.dataset.id);
      setSelectedSpecialty(selectedSpecialty);
      document.getElementById('selected-specialty-label').textContent = selectedSpecialty.name;
      const docs = allDoctors.filter(d => d.specialtyId === selectedSpecialty.id);
      renderDoctors(docs);
      goToStep('doctor');
    });
  });
}

// --- Render Doctors ---
function renderDoctors(docs) {
  const grid = document.getElementById('doctor-grid');
  if (!docs.length) {
    grid.innerHTML = '<div class="empty-state"><p>No doctors found</p></div>';
    return;
  }
  grid.innerHTML = docs.map(d => `
    <div class="doctor-card" data-id="${d.id}">
      <div class="doctor-info">
        <span class="doctor-name">${d.name}</span>
        <span class="doctor-specialty">${d.specialty}</span>
      </div>
      <button class="btn btn-primary btn-sm">Select Slot</button>
    </div>
  `).join('');

  grid.querySelectorAll('.doctor-card').forEach(card => {
    card.querySelector('button').addEventListener('click', () => {
      selectedDoctor = allDoctors.find(d => d.id === card.dataset.id);
      setSelectedDoctor(selectedDoctor);
      document.getElementById('slot-doctor-name').textContent = selectedDoctor.name;
      document.getElementById('slot-doctor-spec').textContent = selectedDoctor.specialty;
      currentDateOffset = 0;
      renderDateStrip();
      renderSlots();
      goToStep('slot');
    });
  });
}

// --- Render Date Strip ---
function renderDateStrip() {
  const strip = document.getElementById('date-strip');
  const today = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const visibleDays = 7;
  const startOffset = currentDateOffset;

  let html = '';
  for (let i = 0; i < visibleDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + startOffset + i);
    const dayName = days[d.getDay()];
    const dayNum = d.getDate();
    const month = months[d.getMonth()];
    const dateStr = d.toISOString().split('T')[0];
    const isSelected = dateStr === selectedDate;
    html += `
      <div class="date-chip ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
        <span class="date-day-name">${dayName}</span>
        <span class="date-day-num">${dayNum}</span>
        <span class="date-month">${month}</span>
      </div>
    `;
  }
  strip.innerHTML = html;

  strip.querySelectorAll('.date-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      selectedDate = chip.dataset.date;
      renderDateStrip();
      renderSlots();
    });
  });

  // Auto-select first if none selected
  if (!selectedDate) {
    const firstChip = strip.querySelector('.date-chip');
    if (firstChip) {
      selectedDate = firstChip.dataset.date;
      firstChip.classList.add('selected');
      renderSlots();
    }
  }
}

// --- Render Time Slots ---
function renderSlots() {
  const morning = ['10:00 AM','10:20 AM','10:40 AM','11:00 AM','11:20 AM','11:40 AM'];
  const afternoon = ['02:00 PM','02:20 PM','02:40 PM','03:00 PM','03:20 PM','03:40 PM'];
  const evening = ['04:00 PM','04:20 PM','04:40 PM','05:00 PM','05:20 PM','05:40 PM'];

  function renderSlotGroup(slots, containerId) {
    const el = document.getElementById(containerId);
    el.innerHTML = slots.map(t => {
      const isBooked = Math.random() < 0.15;
      const isSel = t === selectedSlot;
      return `<button class="slot-btn ${isSel ? 'selected' : ''} ${isBooked ? 'booked' : ''}" 
              data-time="${t}" ${isBooked ? 'disabled' : ''}>${t}</button>`;
    }).join('');
    el.querySelectorAll('.slot-btn:not(.booked)').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSlot = btn.dataset.time;
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }

  renderSlotGroup(morning, 'slots-morning');
  renderSlotGroup(afternoon, 'slots-afternoon');
  renderSlotGroup(evening, 'slots-evening');
}

// --- Confirm Appointment ---
function confirmAppointment() {
  if (!selectedSlot) {
    showToast('Please select a time slot.', 'error');
    return;
  }
  const patient = getSelectedPatient();
  if (!patient) {
    showToast('Please select a patient first.', 'error');
    goToStep('patient');
    return;
  }

  const newAppt = {
    id: 'A_NEW_' + Date.now(),
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientAge: patient.age,
    patientGender: patient.gender[0],
    doctorId: selectedDoctor.id,
    doctorName: selectedDoctor.name,
    specialty: selectedDoctor.specialty,
    date: selectedDate,
    time: selectedSlot,
    status: 'Confirmed'
  };

  appointments.unshift(newAppt);
  selectedSlot = null;
  selectedDate = null;

  goToStep('patient');
  renderUpcomingConsultations();
  showToast(`Appointment booked: ${selectedDoctor.name} at ${newAppt.time}`);
}

// --- Modify Modal ---
function openModifyModal(id) {
  const appt = appointments.find(a => a.id === id);
  if (!appt) return;
  document.getElementById('modify-modal-body').innerHTML = `
    <div style="background: var(--color-bg); border-radius: var(--radius-md); padding: var(--space-4); font-size:14px;">
      <div style="margin-bottom: var(--space-3);">
        <label class="form-label">Patient</label>
        <input class="input-field" value="${appt.patientName}" readonly/>
      </div>
      <div style="margin-bottom: var(--space-3);">
        <label class="form-label">Doctor</label>
        <input class="input-field" value="${appt.doctorName}" readonly/>
      </div>
      <div>
        <label class="form-label">Time</label>
        <input class="input-field" id="modify-time" value="${appt.time}"/>
      </div>
    </div>
  `;
  document.getElementById('modify-modal').classList.remove('hidden');
}

// --- Cancel Modal ---
function openCancelModal(id) {
  const appt = appointments.find(a => a.id === id);
  if (!appt) return;
  pendingCancelId = id;
  document.getElementById('cancel-modal-body').innerHTML = `
    <strong>${appt.patientName}</strong><br/>
    ${appt.doctorName} — ${appt.time}
  `;
  document.getElementById('cancel-modal').classList.remove('hidden');
}
