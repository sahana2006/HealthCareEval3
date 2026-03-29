/* ============================================================
   FOLLOWUP.JS — Follow-Up Coordination page logic
   ============================================================ */

let followUps = [];
let selectedFollowUpId = null;

document.addEventListener('DOMContentLoaded', async () => {
  renderShell('followup');

  const data = await loadData();
  if (!data) {
    showToast('Failed to load data.', 'error');
    return;
  }

  followUps = [...data.followUps];
  renderFollowUps(followUps);

  // --- Search ---
  document.getElementById('followup-search').addEventListener('input', function() {
    const q = this.value.trim();
    if (!q) {
      renderFollowUps(followUps);
      return;
    }
    const filtered = followUps.filter(f => f.phone && f.phone.includes(q));
    renderFollowUps(filtered);
  });

  // --- Modal handlers ---
  document.getElementById('close-followup-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-followup-modal-btn').addEventListener('click', closeModal);
  document.getElementById('confirm-followup-btn').addEventListener('click', confirmBooking);
});

function renderFollowUps(items) {
  const container = document.getElementById('followup-list');
  const empty = document.getElementById('followup-empty');

  if (!items.length) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  container.innerHTML = items.map(f => {
    const priorityClass = f.priority.toLowerCase();
    const priorityBadgeClass = `priority-${priorityClass}`;

    return `
      <div class="followup-card followup-card--${priorityClass}">
        <div class="followup-card-top">
          <div class="followup-patient-name">${f.patientName}</div>
          <div class="followup-doctor-info">${f.doctorName}</div>
          <div class="followup-last-visit">Last Visit : ${f.lastVisit}</div>
        </div>

        <div class="doctor-notes-box">
          <span class="notes-badge">Doctor's Notes(Read Only)</span>
          <div class="notes-text">${f.doctorNote}</div>
          <div class="notes-priority">
            <span class="notes-priority-label">Priority</span>
            <span style="color: var(--color-text-secondary);">:</span>
            <span class="priority-badge ${priorityBadgeClass}">${f.priority}</span>
          </div>
        </div>

        <div class="followup-footer">
          <div class="followup-date-section">
            <span class="followup-date-label">Suggested follow-up Date</span>
            <span class="followup-date-value">${f.suggestedDate}</span>
          </div>
          <button class="btn btn-primary btn-sm book-btn" data-id="${f.id}">Book Follow-up</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', () => openFollowUpModal(btn.dataset.id));
  });
}

function openFollowUpModal(id) {
  const fu = followUps.find(f => f.id === id);
  if (!fu) return;
  selectedFollowUpId = id;

  document.getElementById('followup-modal-body').innerHTML = `
    <div class="followup-modal-info">
      <div class="followup-modal-info-row">
        <span style="color: var(--color-text-secondary);">Patient</span>
        <strong>${fu.patientName}</strong>
      </div>
      <div class="followup-modal-info-row">
        <span style="color: var(--color-text-secondary);">Doctor</span>
        <strong>${fu.doctorName}</strong>
      </div>
      <div class="followup-modal-info-row">
        <span style="color: var(--color-text-secondary);">Suggested Date</span>
        <strong>${fu.suggestedDate}</strong>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Confirm Appointment Date</label>
      <input class="input-field" type="text" id="followup-confirm-date" 
             value="${fu.suggestedDate}" placeholder="e.g. March 15, 2026"/>
      <span class="form-error" id="err-followup-date"></span>
    </div>
    <div class="form-group" style="margin-top: var(--space-3);">
      <label class="form-label">Notes (Optional)</label>
      <input class="input-field" type="text" id="followup-notes" placeholder="Any additional notes..."/>
    </div>
  `;

  document.getElementById('followup-modal').classList.remove('hidden');
}

function confirmBooking() {
  const dateInput = document.getElementById('followup-confirm-date');
  const errEl = document.getElementById('err-followup-date');

  if (!dateInput.value.trim()) {
    dateInput.classList.add('error');
    errEl.textContent = 'Please enter a date.';
    errEl.classList.add('visible');
    return;
  }

  // Remove from list (booked)
  followUps = followUps.filter(f => f.id !== selectedFollowUpId);
  renderFollowUps(followUps);
  closeModal();
  showToast('Follow-up appointment booked successfully!');
}

function closeModal() {
  document.getElementById('followup-modal').classList.add('hidden');
}
