/* ============================================================
   DASHBOARD.JS — Dashboard page logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize shell (sidebar + topbar)
  renderShell('dashboard');

  // Load data
  const data = await loadData();
  if (!data) {
    showToast('Failed to load data. Please refresh.', 'error');
    return;
  }

  // --- Render Stats ---
  document.getElementById('stat-walkins').textContent = data.dashboard.walkInsToday;
  document.getElementById('stat-appointments').textContent = data.dashboard.appointmentsToday;
  document.getElementById('stat-queue').textContent = data.dashboard.patientsInQueue;
  document.getElementById('stat-revenue').textContent = formatCurrency(data.dashboard.todaysRevenue);

  // --- Render Queue (Waiting) ---
  const waitingList = document.getElementById('queue-waiting-list');
  const waitingItems = data.queue.filter(q => q.status === 'Waiting').slice(0, 4);

  if (waitingItems.length === 0) {
    waitingList.innerHTML = '<div class="empty-state"><p>No patients waiting</p></div>';
  } else {
    waitingList.innerHTML = waitingItems.map(item => `
      <div class="queue-item">
        <div class="queue-item-token">Token#${item.token}</div>
        <div class="queue-item-name">${item.patientName}</div>
      </div>
    `).join('');
  }

  // --- Render Queue (In Consultation) ---
  const consultList = document.getElementById('queue-consulting-list');
  const consultItems = data.queue.filter(q => q.status === 'In Consultation').slice(0, 4);

  if (consultItems.length === 0) {
    consultList.innerHTML = '<div class="empty-state"><p>No active consultations</p></div>';
  } else {
    consultList.innerHTML = consultItems.map(item => `
      <div class="queue-item queue-item--consulting">
        <div class="queue-item-token">Token#${item.token}</div>
        <div class="queue-item-name">${item.patientName}</div>
        <div class="queue-item-doctor">${item.doctorName}</div>
      </div>
    `).join('');
  }

  // --- Render Recent Registrations ---
  const regList = document.getElementById('recent-registrations');
  const recentPatient = data.patients[0];

  regList.innerHTML = `
    <div class="reg-item">
      <div class="reg-item-row">
        <span class="reg-item-label">Patient Name</span>
        <span class="reg-item-value">${recentPatient.firstName} ${recentPatient.lastName}</span>
      </div>
      <div class="reg-item-row">
        <span class="reg-item-label">Appointment id</span>
        <span class="reg-item-value">${recentPatient.patientId}</span>
      </div>
      <div class="reg-item-row">
        <span class="reg-item-label">Age &amp; Gender</span>
        <span class="reg-item-value">${recentPatient.age} ${recentPatient.gender}</span>
      </div>
      <div class="reg-item-row">
        <span class="reg-item-label">Phone Number</span>
        <span class="reg-item-value">${recentPatient.phone}</span>
      </div>
    </div>
  `;

  // --- Render Recent Billing ---
  const billingList = document.getElementById('recent-billing');
  const recentBill = data.billings[0];

  billingList.innerHTML = `
    <div class="reg-item billing-item">
      <div class="reg-item-row">
        <span class="reg-item-label">Patient Name</span>
        <span class="reg-item-value">${recentBill.patientName}</span>
      </div>
      <div class="reg-item-row">
        <span class="reg-item-label">Appointment id</span>
        <span class="reg-item-value">${recentBill.appointmentId}</span>
      </div>
      <div class="reg-item-row">
        <span class="reg-item-label">Visit Type</span>
        <span class="reg-item-value">${recentBill.visitType}</span>
      </div>
      <div class="reg-item-row">
        <span class="reg-item-label">Amount Paid</span>
        <span class="reg-item-value">${formatCurrency(recentBill.amount)}</span>
      </div>
    </div>
  `;
});
