// app.js — MEDBITS Doctor Management (consolidated)
// Combines: doctors_data.js + DoctorManagement_view_doctor.js +
//           ViewAllDoctor.js + DoctorManagementAdd.js + Doctor_edit.js
 
/* ════════════════════════════════════════════════════════════════
   1. DOCTOR STORE (localStorage)
   ════════════════════════════════════════════════════════════════ */
(function () {
    const STORAGE_KEY = 'medbits_doctors';
 
    const DEFAULT_DOCTORS = [
        {
            id: 1,
            firstName: 'Alisha', lastName: 'Sharma',
            dob: '1985-05-12', email: 'alisha.sharma@medbits.com',
            gender: 'Female', contact: '9999999999',
            specialization: 'Cardiology', qualification: 'DM',
            department: 'Cardiology',
            experience: '168 months', experienceMonths: '168',
            availableDays: '6 day(s)/week', availableDaysCount: '6',
            timeSlots: '8:00 AM to 1:00 PM',
            slotDuration: '20 minutes', slotDurationMinutes: '20',
        },
        {
            id: 2,
            firstName: 'Elizabeth', lastName: 'O',
            dob: '1980-11-30', email: 'elizabeth.o@medbits.com',
            gender: 'Female', contact: '8888888888',
            specialization: 'Neurology', qualification: 'DM',
            department: 'Cardiology',
            experience: '216 months', experienceMonths: '216',
            availableDays: '5 day(s)/week', availableDaysCount: '5',
            timeSlots: '10:00 AM to 3:00 PM',
            slotDuration: '30 minutes', slotDurationMinutes: '30',
        },
        {
            id: 3,
            firstName: 'Ana', lastName: 'Mary',
            dob: '1990-08-07', email: 'ana.mary@medbits.com',
            gender: 'Female', contact: '7777777777',
            specialization: 'Nephrology', qualification: 'MD',
            department: 'Dermatology',
            experience: '108 months', experienceMonths: '108',
            availableDays: '5 day(s)/week', availableDaysCount: '5',
            timeSlots: '9:00 AM to 2:00 PM',
            slotDuration: '15 minutes', slotDurationMinutes: '15',
        },
        {
            id: 4,
            firstName: 'Sarah', lastName: 'Johnson',
            dob: '1989-10-23', email: 'doc112@gmail.com',
            gender: 'Female', contact: '9823165784',
            specialization: 'Dermatology', qualification: 'MD',
            department: 'Dermatology',
            experience: '132 months', experienceMonths: '132',
            availableDays: '5 day(s)/week', availableDaysCount: '5',
            timeSlots: '9:00 AM to 2:00 PM',
            slotDuration: '15 minutes', slotDurationMinutes: '15',
        },
        {
            id: 5,
            firstName: 'Sarah', lastName: 'Williams',
            dob: '1987-03-15', email: 'sarah.williams@medbits.com',
            gender: 'Female', contact: '6666666666',
            specialization: 'Cardiology', qualification: 'MBBS',
            department: 'FrontDesk',
            experience: '84 months', experienceMonths: '84',
            availableDays: '5 day(s)/week', availableDaysCount: '5',
            timeSlots: '9:00 AM to 5:00 PM',
            slotDuration: '15 minutes', slotDurationMinutes: '15',
        },
    ];
 
    window.DoctorStore = {
        getAll() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) return JSON.parse(raw);
            } catch (e) {}
            this.saveAll(DEFAULT_DOCTORS);
            return DEFAULT_DOCTORS;
        },
        saveAll(doctors) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors)); } catch (e) {}
        },
        getById(id) {
            return this.getAll().find(d => d.id === Number(id)) || null;
        },
        add(doctor) {
            const all = this.getAll();
            const maxId = all.reduce((m, d) => Math.max(m, d.id), 0);
            doctor.id = maxId + 1;
            all.push(doctor);
            this.saveAll(all);
            return doctor;
        },
        update(id, updates) {
            const all = this.getAll();
            const idx = all.findIndex(d => d.id === Number(id));
            if (idx === -1) return false;
            all[idx] = { ...all[idx], ...updates };
            this.saveAll(all);
            return true;
        },
        search(query) {
            if (!query) return this.getAll();
            const q = query.toLowerCase();
            return this.getAll().filter(d =>
                `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
                d.department.toLowerCase().includes(q) ||
                d.specialization.toLowerCase().includes(q) ||
                d.contact.includes(q)
            );
        },
        fullName(doctor) {
            return `${doctor.firstName} ${doctor.lastName}`;
        },
        delete(id) {
            const all = this.getAll();
            const filtered = all.filter(d => d.id !== Number(id));
            if (filtered.length === all.length) return false;
            this.saveAll(filtered);
            return true;
        },
        reset() {
            this.saveAll(DEFAULT_DOCTORS);
        },
    };
})();
 
 
/* ════════════════════════════════════════════════════════════════
   2. SPA ROUTER — page switching
   ════════════════════════════════════════════════════════════════ */
const Pages = {
    VIEW_DOCTOR:     'page-view-doctor',
    VIEW_ALL_DOCTOR: 'page-view-all-doctor',
    ADD_DOCTOR:      'page-add-doctor',
    EDIT_DOCTOR:     'page-edit-doctor',
};
 
let _currentPage = Pages.VIEW_DOCTOR;
let _currentDoctorId = null; // used by edit & detail views
 
function showPage(pageId) {
    Object.values(Pages).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById(pageId);
    if (target) target.style.display = '';
    _currentPage = pageId;
    lucide.createIcons(); // re-render icons for newly shown page
}
 
// Sidebar nav
document.querySelectorAll('.nav-item[data-page]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page === 'view-doctor') {
            navigateTo(Pages.VIEW_DOCTOR);
        }
        // Other sidebar nav items are placeholders in this SPA
    });
});
 
// Quick-action buttons (all pages share the same data-action pattern)
document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'view-doctor')  navigateTo(Pages.VIEW_DOCTOR);
    if (action === 'add-doctor')   navigateTo(Pages.ADD_DOCTOR);
    if (action === 'edit-doctor') {
        // If we're on the detail view, carry that doctor's id into the edit form
        navigateTo(Pages.EDIT_DOCTOR, _currentDoctorId);
    }
});
 
function navigateTo(pageId, doctorId) {
    showPage(pageId);
 
    if (pageId === Pages.VIEW_DOCTOR) {
        initViewPage();
    } else if (pageId === Pages.VIEW_ALL_DOCTOR && doctorId != null) {
        initDetailPage(doctorId);
    } else if (pageId === Pages.ADD_DOCTOR) {
        initAddPage();
    } else if (pageId === Pages.EDIT_DOCTOR) {
        initEditPage(doctorId);
    }
}
 
 
/* ════════════════════════════════════════════════════════════════
   3. SHARED UTILITIES
   ════════════════════════════════════════════════════════════════ */
function showToast(message, type = 'success') {
    const existing = document.getElementById('mb-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'mb-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
        background: type === 'success' ? '#0f766e' : '#dc2626',
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}
 
function setInvalid(el, invalid) {
    if (!el) return;
    if (invalid) el.classList.add('invalid');
    else         el.classList.remove('invalid');
}
 
function formatTime(val) {
    if (!val) return '';
    const [h, m] = val.split(':');
    const hour = parseInt(h);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${suffix}`;
}
 
function to24h(str) {
    if (!str) return '';
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';
    let [, h, m, period] = match;
    h = parseInt(h);
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
}
 
function enforceSingleWordFields(form, fieldNames) {
    fieldNames.forEach(name => {
        const el = form.querySelector(`[name="${name}"]`);
        if (!el) return;
        el.addEventListener('input', () => { el.value = el.value.replace(/\s/g, ''); });
        el.addEventListener('keydown', e => { if (e.key === ' ') e.preventDefault(); });
    });
}
 
function enforceDigitsOnContact(form) {
    const el = form.querySelector('[name="contact"]');
    if (!el) return;
    el.addEventListener('input', () => {
        el.value = el.value.replace(/\D/g, '').slice(0, 10);
    });
}
 
function makeTimeSyncHandler(startEl, endEl, hiddenEl) {
    function sync() {
        if (startEl.value && endEl.value) {
            hiddenEl.value = `${formatTime(startEl.value)} to ${formatTime(endEl.value)}`;
        } else {
            hiddenEl.value = '';
        }
    }
    startEl.addEventListener('change', sync);
    endEl.addEventListener('change', sync);
    return sync;
}
 
function validateForm(form, startEl, endEl) {
    let valid = true;
    const singleWordFields = ['firstName', 'lastName', 'specialization', 'qualification', 'department'];
 
    singleWordFields.forEach(name => {
        const el = form.querySelector(`[name="${name}"]`);
        if (!el) return;
        const ok = el.value.trim() && /^[A-Za-z]+$/.test(el.value.trim());
        setInvalid(el, !ok);
        if (!ok) valid = false;
    });
 
    const dob = form.querySelector('[name="dob"]');
    if (dob) { setInvalid(dob, !dob.value); if (!dob.value) valid = false; }
 
    const email = form.querySelector('[name="email"]');
    if (email) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        setInvalid(email, !ok); if (!ok) valid = false;
    }
 
    const gender = form.querySelector('[name="gender"]');
    if (gender) { setInvalid(gender, !gender.value); if (!gender.value) valid = false; }
 
    const contact = form.querySelector('[name="contact"]');
    if (contact) {
        const ok = /^\d{10}$/.test(contact.value.trim());
        setInvalid(contact, !ok); if (!ok) valid = false;
    }
 
    const exp = form.querySelector('[name="experience"]');
    if (exp) {
        const ok = exp.value !== '' && Number(exp.value) >= 0;
        setInvalid(exp, !ok); if (!ok) valid = false;
    }
 
    const days = form.querySelector('[name="availableDays"]');
    if (days) {
        const ok = days.value !== '' && Number(days.value) >= 1 && Number(days.value) <= 7;
        setInvalid(days, !ok); if (!ok) valid = false;
    }
 
    const slotOk = startEl.value && endEl.value && startEl.value < endEl.value;
    setInvalid(startEl, !slotOk);
    setInvalid(endEl, !slotOk);
    if (!slotOk) valid = false;
 
    const dur = form.querySelector('[name="slotDuration"]');
    if (dur) {
        const ok = dur.value !== '' && Number(dur.value) >= 5;
        setInvalid(dur, !ok); if (!ok) valid = false;
    }
 
    return valid;
}
 
function buildFormPayload(form) {
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.experienceMonths    = data.experience;
    data.experience          = `${data.experience} months`;
    data.availableDaysCount  = data.availableDays;
    data.availableDays       = `${data.availableDays} day(s)/week`;
    data.slotDurationMinutes = data.slotDuration;
    data.slotDuration        = `${data.slotDuration} minutes`;
    return data;
}
 
 
/* ════════════════════════════════════════════════════════════════
   4. VIEW DOCTOR PAGE
   ════════════════════════════════════════════════════════════════ */
function deleteDoctor(id) {
    const doctor = DoctorStore.getById(id);
    if (!doctor) return;
    if (!confirm(`Delete ${DoctorStore.fullName(doctor)}? This cannot be undone.`)) return;
    DoctorStore.delete(id);
    showToast(`${DoctorStore.fullName(doctor)} deleted successfully.`);
    initViewPage();
}
 
function initViewPage() {
    renderDoctorRows(DoctorStore.getAll());
 
    const searchInput = document.getElementById('view-search-input');
    if (searchInput) {
        // Remove old listeners by replacing element
        const fresh = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(fresh, searchInput);
        fresh.addEventListener('input', () => {
            renderDoctorRows(DoctorStore.search(fresh.value.trim()));
        });
    }
}
 
function renderDoctorRows(doctors) {
    const tbody = document.getElementById('doctors-tbody');
    if (!tbody) return;
 
    if (doctors.length === 0) {
        tbody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align:center; color:#6b7280; padding:2rem;">
                No doctors found.
              </td>
            </tr>`;
        return;
    }
 
    tbody.innerHTML = doctors.map(d => `
        <tr>
            <td class="doctor-name">${DoctorStore.fullName(d)}</td>
            <td>${d.department}</td>
            <td>${d.specialization}</td>
            <td>${d.contact}</td>
            <td>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.35rem;">
                    <button class="delete-btn" data-delete-id="${d.id}">Delete</button>
                    <button class="view-link" data-view-id="${d.id}">view all</button>
                </div>
            </td>
        </tr>
    `).join('');
 
    // Attach delete click handlers
    tbody.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.deleteId);
            deleteDoctor(id);
        });
    });
 
    // Attach view-all click handlers
    tbody.querySelectorAll('[data-view-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.viewId);
            _currentDoctorId = id;
            navigateTo(Pages.VIEW_ALL_DOCTOR, id);
        });
    });
}
 
 
/* ════════════════════════════════════════════════════════════════
   5. VIEW ALL DOCTOR (detail) PAGE
   ════════════════════════════════════════════════════════════════ */
const PERSONAL_FIELDS = [
    ['firstName', 'First Name'],
    ['lastName',  'Last Name'],
    ['dob',       'Date of Birth'],
    ['email',     'E-Mail Id'],
    ['gender',    'Gender'],
    ['contact',   'Contact No'],
];
const EMPLOYMENT_FIELDS = [
    ['specialization', 'Specialization'],
    ['qualification',  'Qualification'],
    ['department',     'Department'],
    ['experience',     'Experience'],
];
const AVAILABILITY_FIELDS = [
    ['availableDays', 'Available Days'],
    ['timeSlots',     'Time Slots'],
    ['slotDuration',  'Slot Duration'],
];
 
function initDetailPage(id) {
    const doctor = DoctorStore.getById(id);
    if (!doctor) {
        const container = document.querySelector('#page-view-all-doctor .details-container');
        if (container) {
            container.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');
            const hdr = container.querySelector('.details-header');
            if (hdr) {
                const msg = document.createElement('p');
                msg.textContent = 'Doctor not found. Please go back and select a valid record.';
                Object.assign(msg.style, { color: '#dc2626', marginTop: '1rem', fontSize: '1.1rem' });
                hdr.insertAdjacentElement('afterend', msg);
            }
        }
        return;
    }
 
    // Title
    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = `All Details of ${DoctorStore.fullName(doctor)}`;
 
    // Render sections
    renderInfoGrid('detail-personal',      PERSONAL_FIELDS,     doctor);
    renderInfoGrid('detail-employment',    EMPLOYMENT_FIELDS,   doctor);
    renderInfoGrid('detail-availability',  AVAILABILITY_FIELDS, doctor);
 
    // Back button
    const backBtn = document.getElementById('back-to-list-btn');
    if (backBtn) {
        const fresh = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(fresh, backBtn);
        lucide.createIcons();
        fresh.addEventListener('click', () => navigateTo(Pages.VIEW_DOCTOR));
    }
 
    // Edit button — carry doctor id
    const editBtn = document.getElementById('detail-edit-btn');
    if (editBtn) {
        editBtn.dataset.doctorId = doctor.id;
    }
}
 
function renderInfoGrid(gridId, fields, doctor) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = fields.map(([key, label]) => `
        <div class="info-field">
            <label>${label}</label>
            <input type="text" value="${doctor[key] || '—'}" readonly>
        </div>
    `).join('');
}
 
 
/* ════════════════════════════════════════════════════════════════
   6. ADD DOCTOR PAGE
   ════════════════════════════════════════════════════════════════ */
let _addFormInitialized = false;
 
function initAddPage() {
    const form = document.getElementById('addDoctorForm');
    if (!form) return;
 
    form.reset();
 
    // Set max DOB
    document.getElementById('add-dob').max = new Date().toISOString().split('T')[0];
 
    if (!_addFormInitialized) {
        _addFormInitialized = true;
 
        enforceSingleWordFields(form, ['firstName', 'lastName', 'specialization', 'qualification', 'department']);
        enforceDigitsOnContact(form);
 
        const startEl  = document.getElementById('add-timeSlotStart');
        const endEl    = document.getElementById('add-timeSlotEnd');
        const hiddenEl = document.getElementById('add-timeSlots');
        const syncTime = makeTimeSyncHandler(startEl, endEl, hiddenEl);
 
        form.addEventListener('submit', e => {
            e.preventDefault();
            form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
            syncTime();
 
            if (!validateForm(form, startEl, endEl)) {
                showToast('Please fix the highlighted fields.', 'error');
                return;
            }
 
            const data = buildFormPayload(form);
            DoctorStore.add(data);
            showToast('Doctor profile added successfully!');
            form.reset();
            setTimeout(() => navigateTo(Pages.VIEW_DOCTOR), 1500);
        });
 
        const cancelBtn = document.getElementById('add-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Discard changes and go back?')) {
                    navigateTo(Pages.VIEW_DOCTOR);
                }
            });
        }
    }
}
 
 
/* ════════════════════════════════════════════════════════════════
   7. EDIT DOCTOR PAGE
   ════════════════════════════════════════════════════════════════ */
let _editFormInitialized = false;
let _editCurrentDoctorId = null;
 
function initEditPage(preloadId) {
    const form = document.getElementById('editDoctorForm');
    if (!form) return;
 
    form.reset();
    _editCurrentDoctorId = null;
 
    // Set max DOB
    document.getElementById('edit-dob').max = new Date().toISOString().split('T')[0];
 
    const startEl  = document.getElementById('edit-timeSlotStart');
    const endEl    = document.getElementById('edit-timeSlotEnd');
    const hiddenEl = document.getElementById('edit-timeSlots');
 
    if (!_editFormInitialized) {
        _editFormInitialized = true;
 
        enforceSingleWordFields(form, ['firstName', 'lastName', 'specialization', 'qualification', 'department']);
        enforceDigitsOnContact(form);
 
        const syncTime = makeTimeSyncHandler(startEl, endEl, hiddenEl);
 
        // Search input
        const searchInput = document.getElementById('edit-search-input');
        const searchBox   = searchInput ? searchInput.closest('.search-box') : null;
 
        if (searchInput && searchBox) {
            searchInput.addEventListener('input', () => {
                const q = searchInput.value.trim();
                if (!q) { removeEditDropdown(); return; }
                buildEditDropdown(DoctorStore.search(q), searchBox, searchInput, form, startEl, endEl, hiddenEl);
            });
 
            searchInput.addEventListener('blur', () => {
                setTimeout(removeEditDropdown, 150);
            });
        }
 
        // Submit
        form.addEventListener('submit', e => {
            e.preventDefault();
            form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
 
            if (!_editCurrentDoctorId) {
                showToast('Please search and select a doctor first.', 'error');
                if (searchInput) searchInput.focus();
                return;
            }
 
            syncTime();
            if (!validateForm(form, startEl, endEl)) {
                showToast('Please fix the highlighted fields.', 'error');
                return;
            }
 
            const data = buildFormPayload(form);
            const ok = DoctorStore.update(_editCurrentDoctorId, data);
            if (ok) {
                showToast('Doctor profile updated successfully!');
                setTimeout(() => navigateTo(Pages.VIEW_DOCTOR), 1500);
            } else {
                showToast('Update failed. Doctor not found.', 'error');
            }
        });
 
        // Cancel
        const cancelBtn = document.getElementById('edit-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Discard changes and go back?')) {
                    navigateTo(Pages.VIEW_DOCTOR);
                }
            });
        }
    }
 
    // Pre-load a doctor if id was passed (e.g. from detail page edit button)
    if (preloadId != null) {
        const doctor = DoctorStore.getById(preloadId);
        if (doctor) {
            populateEditForm(form, doctor, startEl, endEl, hiddenEl);
            const searchInput = document.getElementById('edit-search-input');
            if (searchInput) searchInput.value = DoctorStore.fullName(doctor);
        }
    }
}
 
function populateEditForm(form, doctor, startEl, endEl, hiddenEl) {
    const setVal = (name, val) => {
        const el = form.querySelector(`[name="${name}"]`);
        if (el) el.value = val || '';
    };
 
    setVal('firstName',      doctor.firstName);
    setVal('lastName',       doctor.lastName);
    setVal('dob',            doctor.dob);
    setVal('email',          doctor.email);
    setVal('gender',         doctor.gender);
    setVal('contact',        doctor.contact);
    setVal('specialization', doctor.specialization);
    setVal('qualification',  doctor.qualification);
    setVal('department',     doctor.department);
 
    const expNum  = parseInt(doctor.experienceMonths   || doctor.experience)  || '';
    const daysNum = parseInt(doctor.availableDaysCount || doctor.availableDays) || '';
    const durNum  = parseInt(doctor.slotDurationMinutes || doctor.slotDuration) || '';
    setVal('experience',    expNum);
    setVal('availableDays', daysNum);
    setVal('slotDuration',  durNum);
 
    if (doctor.timeSlots && doctor.timeSlots.includes(' to ')) {
        const parts = doctor.timeSlots.split(' to ');
        startEl.value = to24h(parts[0].trim());
        endEl.value   = to24h(parts[1].trim());
        if (startEl.value && endEl.value) {
            hiddenEl.value = `${formatTime(startEl.value)} to ${formatTime(endEl.value)}`;
        }
    } else {
        startEl.value = '';
        endEl.value   = '';
    }
 
    _editCurrentDoctorId = doctor.id;
}
 
function removeEditDropdown() {
    const drop = document.getElementById('mb-search-dropdown');
    if (drop) drop.remove();
}
 
function buildEditDropdown(doctors, searchBox, searchInput, form, startEl, endEl, hiddenEl) {
    removeEditDropdown();
    if (!doctors.length) return;
 
    const dropdown = document.createElement('ul');
    dropdown.id = 'mb-search-dropdown';
 
    doctors.forEach(d => {
        const li = document.createElement('li');
        li.textContent = DoctorStore.fullName(d);
        li.addEventListener('mousedown', e => {
            e.preventDefault();
            populateEditForm(form, d, startEl, endEl, hiddenEl);
            searchInput.value = DoctorStore.fullName(d);
            removeEditDropdown();
            showToast(`Loaded profile of ${DoctorStore.fullName(d)}`);
        });
        dropdown.appendChild(li);
    });
 
    searchBox.appendChild(dropdown);
}
 
 
/* ════════════════════════════════════════════════════════════════
   8. BOOT
   ════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    // Start on View Doctor page
    navigateTo(Pages.VIEW_DOCTOR);
});
