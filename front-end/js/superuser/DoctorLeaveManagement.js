// ============================================================
// DATA STORE
// ============================================================
const leaveRequests = [
    { id: 1, name: 'Dr. Alisha Sharma',  dept: 'Cardiology',  startDate: '2025-03-09', endDate: '2025-03-11', type: 'Sick',      reason: 'Viral Fever',       status: 'pending', dateRange: 'Mar 9 – Mar 11'  },
    { id: 2, name: 'Dr. Elizabeth O',    dept: 'Cardiology',  startDate: '2025-10-25', endDate: '2025-10-27', type: 'Casual',    reason: 'Family Function',   status: 'pending', dateRange: 'Oct 25 – Oct 27' },
    { id: 3, name: 'Dr. Ana Mary',       dept: 'Dermatology', startDate: '2025-05-09', endDate: '2025-05-10', type: 'Emergency', reason: 'Medical Emergency', status: 'pending', dateRange: 'May 9 – May 10'  },
    { id: 4, name: 'Mrs. Sarah Williams',dept: 'Front Desk',  startDate: '2025-04-10', endDate: '2025-04-13', type: 'Casual',    reason: 'Family Function',   status: 'pending', dateRange: 'Apr 10 – Apr 13' },
    { id: 5, name: 'Dr. Raj Patel',      dept: 'Neurology',   startDate: '2025-06-15', endDate: '2025-06-16', type: 'Sick',      reason: 'Migraine',          status: 'pending', dateRange: 'Jun 15 – Jun 16' },
    { id: 6, name: 'Dr. Priya Nair',     dept: 'Oncology',    startDate: '2025-07-20', endDate: '2025-07-25', type: 'Emergency', reason: 'Family Emergency',  status: 'pending', dateRange: 'Jul 20 – Jul 25' },
];

let activeFilter = null;
let currentViewAll = 'approved';
let toastTimer = null;

// ============================================================
// HELPERS
// ============================================================

/**
 * Returns the CSS class for a leave type badge.
 */
function getTypeClass(type) {
    if (type === 'Sick')      return 'type-sick';
    if (type === 'Casual')    return 'type-casual';
    return 'type-emergency';
}

/**
 * Checks if a given filterDate (string 'YYYY-MM-DD') falls within
 * the startDate–endDate range of a request.
 */
function dateInRange(startDate, endDate, filterDate) {
    const start  = new Date(startDate);
    const end    = new Date(endDate);
    const filter = new Date(filterDate);
    return filter >= start && filter <= end;
}

// ============================================================
// COUNTS
// ============================================================

/**
 * Recalculates pending / approved / rejected counts and
 * updates the three counter elements with an animation.
 */
function updateCounts() {
    const pending  = leaveRequests.filter(r => r.status === 'pending').length;
    const approved = leaveRequests.filter(r => r.status === 'approved').length;
    const rejected = leaveRequests.filter(r => r.status === 'rejected').length;

    animateCount('count-pending',  pending);
    animateCount('count-approved', approved);
    animateCount('count-rejected', rejected);

    document.getElementById('pending-badge').textContent = `${pending} pending`;
}

/**
 * Updates a counter element's text and triggers the pop animation.
 */
function animateCount(id, val) {
    const el = document.getElementById(id);
    el.textContent = val;
    el.classList.remove('count-pop');
    void el.offsetWidth;          // force reflow to restart animation
    el.classList.add('count-pop');
}

// ============================================================
// RENDER LEAVE TABLE (main page)
// ============================================================

/**
 * Renders the pending-requests table, applying the active date
 * filter if one is set.  Shows the empty-state if no rows match.
 */
function renderTable() {
    const tbody      = document.getElementById('leave-table-body');
    const emptyState = document.getElementById('empty-state');

    let rows = leaveRequests.filter(r => r.status === 'pending');

    if (activeFilter) {
        rows = rows.filter(r => dateInRange(r.startDate, r.endDate, activeFilter));
    }

    if (rows.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        lucide.createIcons();
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = rows.map(r => `
        <tr id="row-${r.id}">
            <td class="doctor-name">${r.name}</td>
            <td>${r.dept}</td>
            <td><span style="font-family:'DM Mono',monospace;font-size:0.8rem">${r.dateRange}</span></td>
            <td><span class="type-badge ${getTypeClass(r.type)}">${r.type}</span></td>
            <td>${r.reason}</td>
            <td class="actions">
                <button class="btn btn-approve" onclick="handleAction(${r.id}, 'approved')">✓ Approve</button>
                <button class="btn btn-reject"  onclick="handleAction(${r.id}, 'rejected')">✕ Reject</button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

// ============================================================
// APPROVE / REJECT ACTION
// ============================================================

/**
 * Handles an approve or reject button click.
 * Animates the row out, updates the request's status,
 * refreshes counts and re-renders the table.
 */
function handleAction(id, action) {
    const req = leaveRequests.find(r => r.id === id);
    if (!req) return;

    const row = document.getElementById(`row-${id}`);
    if (row) {
        row.style.transition  = 'opacity 0.35s, transform 0.35s';
        row.style.opacity     = '0';
        row.style.transform   = 'translateX(30px)';

        setTimeout(() => {
            req.status     = action;
            req.actionedOn = new Date().toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            updateCounts();
            renderTable();
        }, 350);
    }

    showToast(req.name, action);
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================

/**
 * Shows a brief toast notification confirming the action taken.
 */
function showToast(name, action) {
    const toast = document.getElementById('toast');
    const msg   = document.getElementById('toast-msg');
    const icon  = document.getElementById('toast-icon');

    clearTimeout(toastTimer);
    toast.className = 'toast';

    if (action === 'approved') {
        toast.classList.add('toast-approve');
        icon.setAttribute('data-lucide', 'check-circle');
        msg.textContent = `${name}'s leave approved`;
    } else {
        toast.classList.add('toast-reject');
        icon.setAttribute('data-lucide', 'x-circle');
        msg.textContent = `${name}'s leave rejected`;
    }

    lucide.createIcons();
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============================================================
// DATE FILTER
// ============================================================

/**
 * Reads the date picker value and re-renders the table
 * showing only requests that overlap that date.
 */
function applyDateFilter() {
    const val = document.getElementById('date-filter').value;
    if (!val) { clearFilter(); return; }

    activeFilter = val;

    const d     = new Date(val);
    const label = d.toLocaleDateString('en-US', {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
    });

    const info = document.getElementById('filter-info');
    info.textContent    = `Showing: ${label}`;
    info.style.display  = 'inline-flex';

    renderTable();
}

/**
 * Clears the active date filter and shows all pending requests.
 */
function clearFilter() {
    activeFilter = null;
    document.getElementById('date-filter').value  = '';
    document.getElementById('filter-info').style.display = 'none';
    renderTable();
}

// ============================================================
// PAGE NAVIGATION
// ============================================================

/**
 * Switches the visible page panel.
 * @param {'main'} name  - currently supports 'main'
 */
function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    if (name === 'main') {
        document.getElementById('page-main').classList.add('active');
        document.getElementById('header-title-text').textContent = 'Staff Leave Management';
        renderTable();
    }
}

/**
 * Switches to the "View All" page for either approved or rejected requests.
 * @param {'approved'|'rejected'} type
 */
function showViewAll(type) {
    currentViewAll = type;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-viewall').classList.add('active');

    const titleEl   = document.getElementById('viewall-title');
    const pillEl    = document.getElementById('viewall-pill');
    const emptyMsg  = document.getElementById('viewall-empty-msg');
    const headerTxt = document.getElementById('header-title-text');

    if (type === 'approved') {
        titleEl.textContent  = 'Approved Leave Requests';
        pillEl.textContent   = 'Approved';
        pillEl.className     = 'status-pill pill-approved';
        emptyMsg.textContent = 'No approved requests yet';
        headerTxt.textContent = 'Approved Leave Requests';
    } else {
        titleEl.textContent  = 'Rejected Leave Requests';
        pillEl.textContent   = 'Rejected';
        pillEl.className     = 'status-pill pill-rejected';
        emptyMsg.textContent = 'No rejected requests yet';
        headerTxt.textContent = 'Rejected Leave Requests';
    }

    renderViewAll(type);
}

/**
 * Renders the approved or rejected requests table on the View All page.
 * @param {'approved'|'rejected'} type
 */
function renderViewAll(type) {
    const tbody = document.getElementById('viewall-table-body');
    const empty = document.getElementById('viewall-empty');
    const rows  = leaveRequests.filter(r => r.status === type);

    if (rows.length === 0) {
        tbody.innerHTML      = '';
        empty.style.display  = 'block';
        lucide.createIcons();
        return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = rows.map(r => `
        <tr>
            <td class="doctor-name">${r.name}</td>
            <td>${r.dept}</td>
            <td><span style="font-family:'DM Mono',monospace;font-size:0.8rem">${r.dateRange}</span></td>
            <td><span class="type-badge ${getTypeClass(r.type)}">${r.type}</span></td>
            <td>${r.reason}</td>
            <td style="font-size:0.78rem;color:var(--text-muted)">${r.actionedOn || '—'}</td>
        </tr>
    `).join('');

    lucide.createIcons();
}

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateCounts();
    renderTable();
});
