// app.js — MEDBITS Front Desk Management (consolidated)

// ════════════════════════════════════════════════════════════
// STAFF STORE (from staff_data.js)
// ════════════════════════════════════════════════════════════
(function () {
    const STORAGE_KEY = 'medbits_staff';

    const DEFAULT_STAFF = [
        {
            id: 1,
            firstName: 'Ananya', lastName: 'Sharma',
            dob: '1996-03-14', email: 'ananya.sharma@medbits.com',
            gender: 'Female', contact: '9999999999',
            reportingManagerId: 'AH101', languageCount: 2,
            languages: ['English', 'Hindi'],
            dateJoining: '2021-06-01', counter: '1',
            shiftStart: '08:00', shiftEnd: '16:00',
        },
        {
            id: 2,
            firstName: 'Elizabeth', lastName: 'O',
            dob: '1991-07-22', email: 'elizabeth.o@medbits.com',
            gender: 'Female', contact: '8888888888',
            reportingManagerId: 'AH102', languageCount: 3,
            languages: ['English', 'French', 'Spanish'],
            dateJoining: '2019-09-15', counter: '2',
            shiftStart: '09:00', shiftEnd: '17:00',
        },
        {
            id: 3,
            firstName: 'Ana', lastName: 'Mary',
            dob: '1993-11-05', email: 'ana.mary@medbits.com',
            gender: 'Female', contact: '7777777777',
            reportingManagerId: 'AH103', languageCount: 2,
            languages: ['English', 'Malayalam'],
            dateJoining: '2020-02-10', counter: '3',
            shiftStart: '10:00', shiftEnd: '18:00',
        },
        {
            id: 4,
            firstName: 'Sarah', lastName: 'Williams',
            dob: '1995-08-30', email: 'sarah.williams@medbits.com',
            gender: 'Female', contact: '6666666666',
            reportingManagerId: 'AH104', languageCount: 1,
            languages: ['English'],
            dateJoining: '2022-01-03', counter: '4',
            shiftStart: '07:00', shiftEnd: '15:00',
        },
    ];

    window.StaffStore = {
        getAll() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) return JSON.parse(raw);
            } catch (e) {}
            this.saveAll(DEFAULT_STAFF);
            return DEFAULT_STAFF;
        },
        saveAll(staff) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(staff)); } catch (e) {}
        },
        getById(id) {
            return this.getAll().find(s => s.id === Number(id)) || null;
        },
        add(member) {
            const all = this.getAll();
            const maxId = all.reduce((m, s) => Math.max(m, s.id), 0);
            member.id = maxId + 1;
            all.push(member);
            this.saveAll(all);
            return member;
        },
        update(id, updates) {
            const all = this.getAll();
            const idx = all.findIndex(s => s.id === Number(id));
            if (idx === -1) return false;
            all[idx] = { ...all[idx], ...updates };
            this.saveAll(all);
            return true;
        },
        search(query) {
            if (!query) return this.getAll();
            const q = query.toLowerCase();
            return this.getAll().filter(s =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                s.contact.includes(q) ||
                (s.languages || []).some(l => l.toLowerCase().includes(q))
            );
        },
        fullName(member) { return `${member.firstName} ${member.lastName}`; },
        formatShift(member) { return formatTime12(member.shiftStart) + ' - ' + formatTime12(member.shiftEnd); },
        reset() { this.saveAll(DEFAULT_STAFF); },
    };

    function formatTime12(val) {
        if (!val) return '';
        const [h, m] = val.split(':');
        const hour = parseInt(h);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${m} ${suffix}`;
    }
    window.formatTime12 = formatTime12;
})();


// ════════════════════════════════════════════════════════════
// PAGE ROUTING
// ════════════════════════════════════════════════════════════
let _currentViewAllId = null; // track which staff we last viewed (for Edit link)

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + name);
    if (page) page.classList.add('active');

    // Re-render table each time View is shown (picks up new/updated data)
    if (name === 'view') {
        renderStaffTable(StaffStore.getAll());
    }

    // Re-init edit page
    if (name === 'edit') {
        initEditPage();
    }

    // Scroll to top
    document.querySelector('.content').scrollTop = 0;

    // Re-run lucide icons for any newly shown elements
    lucide.createIcons();
}

// Called from ViewAll page "Edit Staff Profile" quick action
function goEditFromView() {
    showPage('edit');
    if (_currentViewAllId) {
        const member = StaffStore.getById(_currentViewAllId);
        if (member) {
            populateEditForm(member);
            document.getElementById('editSearchInput').value = StaffStore.fullName(member);
        }
    }
}

window.showPage = showPage;
window.goEditFromView = goEditFromView;


// ════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ════════════════════════════════════════════════════════════
function showToast(message, type = 'success') {
    const existing = document.getElementById('mb-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'mb-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '2rem', right: '2rem',
        background: type === 'success' ? '#0f766e' : '#dc2626',
        color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem',
        fontSize: '1rem', fontWeight: '600',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: '9999',
        transition: 'opacity 0.4s',
    });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2800);
}

function setInvalid(el, invalid) {
    if (!el) return;
    invalid ? el.classList.add('invalid') : el.classList.remove('invalid');
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    return `${d}/${m}/${y}`;
}

// Enforce single word (no spaces) on an input
function enforceSingleWord(el) {
    el.addEventListener('input', () => { el.value = el.value.replace(/\s/g, ''); });
    el.addEventListener('keydown', e => { if (e.key === ' ') e.preventDefault(); });
}

// Enforce digits-only on a tel input
function enforceDigits(el, maxLen) {
    el.addEventListener('input', () => {
        el.value = el.value.replace(/\D/g, '').slice(0, maxLen);
    });
}


// ════════════════════════════════════════════════════════════
// VIEW STAFF PAGE
// ════════════════════════════════════════════════════════════
function renderStaffTable(members) {
    const tbody = document.getElementById('staffTableBody');
    if (!members.length) {
        tbody.innerHTML = `
            <tr><td colspan="5" style="text-align:center;color:#6b7280;padding:2rem;">
                No staff members found.
            </td></tr>`;
        return;
    }
    tbody.innerHTML = members.map(m => `
        <tr>
            <td class="staff-name">${StaffStore.fullName(m)}</td>
            <td>Counter ${m.counter}</td>
            <td>${(m.languages || []).join(', ') || '—'}</td>
            <td>${m.contact}</td>
            <td class="view-all">
                <a href="javascript:void(0)" onclick="openViewAll(${m.id})">view all</a>
            </td>
        </tr>`).join('');
}
window.openViewAll = function(id) {
    _currentViewAllId = id;
    renderViewAll(id);
    showPage('viewall');
};

function initViewPage() {
    const searchInput = document.getElementById('viewSearchInput');
    renderStaffTable(StaffStore.getAll());
    searchInput.addEventListener('input', () => {
        renderStaffTable(StaffStore.search(searchInput.value.trim()));
    });
}


// ════════════════════════════════════════════════════════════
// VIEW ALL (DETAIL) PAGE
// ════════════════════════════════════════════════════════════
function renderViewAll(id) {
    const member = StaffStore.getById(id);
    if (!member) {
        document.getElementById('profileTitle').textContent = 'Staff member not found';
        document.getElementById('personalGrid').innerHTML = '';
        document.getElementById('professionalGrid').innerHTML = '';
        document.getElementById('availabilityGrid').innerHTML = '';
        return;
    }

    document.getElementById('profileTitle').textContent = `All Details of ${StaffStore.fullName(member)}`;

    function field(label, value) {
        return `<div class="info-group">
            <label>${label}</label>
            <div class="info-value">${value || '—'}</div>
        </div>`;
    }

    document.getElementById('personalGrid').innerHTML = [
        field('First Name', member.firstName),
        field('Last Name', member.lastName),
        field('Date of Birth', formatDate(member.dob)),
        field('E-Mail Id', member.email),
        field('Gender', member.gender),
        field('Contact No', member.contact),
    ].join('');

    const langDisplay = (member.languages || []).length
        ? member.languages.map((l, i) => `Language ${i + 1}: ${l}`).join(' | ')
        : '—';

    document.getElementById('professionalGrid').innerHTML = [
        field('Reporting Manager ID', member.reportingManagerId),
        field('Language Proficiency', langDisplay),
        field('Date of Joining', formatDate(member.dateJoining)),
    ].join('');

    document.getElementById('availabilityGrid').innerHTML = [
        field('Counter Number', `Counter ${member.counter}`),
        field('Current Shift', `${formatTime12(member.shiftStart)} - ${formatTime12(member.shiftEnd)}`),
    ].join('');
}


// ════════════════════════════════════════════════════════════
// ADD STAFF PAGE
// ════════════════════════════════════════════════════════════
function initAddPage() {
    const form = document.getElementById('addStaffForm');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('add_dob').max = today;
    document.getElementById('add_dateJoining').max = today;

    // Single-word fields
    ['add_firstName', 'add_lastName', 'add_reportingManagerId'].forEach(id => {
        enforceSingleWord(document.getElementById(id));
    });

    // Digits-only contact
    enforceDigits(document.getElementById('add_contact'), 10);

    // Language generation
    const langCountInput  = document.getElementById('add_languageCount');
    const langBoxesDiv    = document.getElementById('add_languageBoxes');
    const langCountHidden = document.getElementById('add_languageCountHidden');
    const generateBtn     = document.getElementById('add_generateLangBtn');

    generateBtn.addEventListener('click', () => {
        const count = parseInt(langCountInput.value);
        if (!count || count < 1 || count > 3) {
            langCountInput.classList.add('invalid');
            showToast('Enter a number between 1 and 3.', 'error');
            return;
        }
        langCountInput.classList.remove('invalid');
        langBoxesDiv.innerHTML = '';
        langCountHidden.value = count;
        for (let i = 1; i <= count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `add_language_${i}`;
            input.placeholder = `Language ${i}`;
            input.className = 'language-box';
            enforceSingleWord(input);
            langBoxesDiv.appendChild(input);
        }
    });

    // Validation
    function validate() {
        let valid = true;

        ['add_firstName', 'add_lastName', 'add_reportingManagerId'].forEach(id => {
            const el = document.getElementById(id);
            const ok = el.value.trim() && /^[A-Za-z0-9]+$/.test(el.value.trim());
            setInvalid(el, !ok);
            if (!ok) valid = false;
        });

        const dob = document.getElementById('add_dob');
        setInvalid(dob, !dob.value);
        if (!dob.value) valid = false;

        const email = document.getElementById('add_email');
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        setInvalid(email, !emailOk);
        if (!emailOk) valid = false;

        const gender = document.getElementById('add_gender');
        setInvalid(gender, !gender.value);
        if (!gender.value) valid = false;

        const contact = document.getElementById('add_contact');
        const contactOk = /^\d{10}$/.test(contact.value.trim());
        setInvalid(contact, !contactOk);
        if (!contactOk) valid = false;

        const count = parseInt(langCountHidden.value);
        if (!count || count < 1 || count > 3) {
            setInvalid(langCountInput, true);
            valid = false;
        } else {
            setInvalid(langCountInput, false);
            for (let i = 1; i <= count; i++) {
                const box = langBoxesDiv.querySelector(`[name="add_language_${i}"]`);
                const ok = box && box.value.trim();
                setInvalid(box, !ok);
                if (!ok) valid = false;
            }
        }

        const doj = document.getElementById('add_dateJoining');
        setInvalid(doj, !doj.value);
        if (!doj.value) valid = false;

        const counter = document.getElementById('add_counter');
        const counterOk = counter.value !== '' && parseInt(counter.value) >= 1;
        setInvalid(counter, !counterOk);
        if (!counterOk) valid = false;

        const start = document.getElementById('add_shiftStart');
        const end   = document.getElementById('add_shiftEnd');
        const shiftOk = start.value && end.value && start.value < end.value;
        setInvalid(start, !shiftOk);
        setInvalid(end,   !shiftOk);
        if (!shiftOk) valid = false;

        return valid;
    }

    // Submit
    form.addEventListener('submit', e => {
        e.preventDefault();
        form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

        if (!validate()) {
            showToast('Please fix the highlighted fields.', 'error');
            return;
        }

        const count = parseInt(langCountHidden.value);
        const languages = [];
        for (let i = 1; i <= count; i++) {
            const box = langBoxesDiv.querySelector(`[name="add_language_${i}"]`);
            if (box) languages.push(box.value.trim());
        }

        const member = {
            firstName:          document.getElementById('add_firstName').value.trim(),
            lastName:           document.getElementById('add_lastName').value.trim(),
            dob:                document.getElementById('add_dob').value,
            email:              document.getElementById('add_email').value.trim(),
            gender:             document.getElementById('add_gender').value,
            contact:            document.getElementById('add_contact').value.trim(),
            reportingManagerId: document.getElementById('add_reportingManagerId').value.trim(),
            languageCount:      count,
            languages,
            dateJoining:        document.getElementById('add_dateJoining').value,
            counter:            document.getElementById('add_counter').value.trim(),
            shiftStart:         document.getElementById('add_shiftStart').value,
            shiftEnd:           document.getElementById('add_shiftEnd').value,
        };

        StaffStore.add(member);
        showToast('Staff profile added successfully!');
        form.reset();
        langBoxesDiv.innerHTML = '';
        langCountHidden.value = '';

        setTimeout(() => { showPage('view'); }, 1500);
    });

    // Cancel
    document.getElementById('add_cancelBtn').addEventListener('click', () => {
        if (confirm('Discard changes and go back?')) showPage('view');
    });
}


// ════════════════════════════════════════════════════════════
// EDIT STAFF PAGE
// ════════════════════════════════════════════════════════════
let _editCurrentStaffId = null;

function initEditPage() {
    // Only wire up once — guard with a flag
    if (document.getElementById('editStaffForm')._editInited) return;
    document.getElementById('editStaffForm')._editInited = true;

    const form = document.getElementById('editStaffForm');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('edit_dob').max = today;
    document.getElementById('edit_dateJoining').max = today;

    ['edit_firstName', 'edit_lastName', 'edit_reportingManagerId'].forEach(id => {
        enforceSingleWord(document.getElementById(id));
    });
    enforceDigits(document.getElementById('edit_contact'), 10);

    const langCountInput  = document.getElementById('edit_languageCount');
    const langBoxesDiv    = document.getElementById('edit_languageBoxes');
    const langCountHidden = document.getElementById('edit_languageCountHidden');
    const generateBtn     = document.getElementById('edit_generateLangBtn');
    const searchInput     = document.getElementById('editSearchInput');

    generateBtn.addEventListener('click', () => {
        const count = parseInt(langCountInput.value);
        if (!count || count < 1 || count > 3) {
            langCountInput.classList.add('invalid');
            showToast('Enter a number between 1 and 3.', 'error');
            return;
        }
        langCountInput.classList.remove('invalid');
        buildEditLangBoxes(count);
    });

    // Search dropdown
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        if (!q) { removeDropdown(); return; }
        buildDropdown(StaffStore.search(q));
    });
    searchInput.addEventListener('blur', () => {
        setTimeout(removeDropdown, 150);
    });

    // Validate
    function validate() {
        let valid = true;

        ['edit_firstName', 'edit_lastName', 'edit_reportingManagerId'].forEach(id => {
            const el = document.getElementById(id);
            const ok = el.value.trim() && /^[A-Za-z0-9]+$/.test(el.value.trim());
            setInvalid(el, !ok);
            if (!ok) valid = false;
        });

        const dob = document.getElementById('edit_dob');
        setInvalid(dob, !dob.value);
        if (!dob.value) valid = false;

        const email = document.getElementById('edit_email');
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        setInvalid(email, !emailOk);
        if (!emailOk) valid = false;

        const gender = document.getElementById('edit_gender');
        setInvalid(gender, !gender.value);
        if (!gender.value) valid = false;

        const contact = document.getElementById('edit_contact');
        const contactOk = /^\d{10}$/.test(contact.value.trim());
        setInvalid(contact, !contactOk);
        if (!contactOk) valid = false;

        const count = parseInt(langCountHidden.value);
        if (!count || count < 1 || count > 3) {
            setInvalid(langCountInput, true);
            valid = false;
        } else {
            setInvalid(langCountInput, false);
            for (let i = 1; i <= count; i++) {
                const box = langBoxesDiv.querySelector(`[name="edit_language_${i}"]`);
                const ok = box && box.value.trim();
                setInvalid(box, !ok);
                if (!ok) valid = false;
            }
        }

        const doj = document.getElementById('edit_dateJoining');
        setInvalid(doj, !doj.value);
        if (!doj.value) valid = false;

        const counter = document.getElementById('edit_counter');
        const counterOk = counter.value !== '' && parseInt(counter.value) >= 1;
        setInvalid(counter, !counterOk);
        if (!counterOk) valid = false;

        const start = document.getElementById('edit_shiftStart');
        const end   = document.getElementById('edit_shiftEnd');
        const shiftOk = start.value && end.value && start.value < end.value;
        setInvalid(start, !shiftOk);
        setInvalid(end,   !shiftOk);
        if (!shiftOk) valid = false;

        return valid;
    }

    // Submit
    form.addEventListener('submit', e => {
        e.preventDefault();
        form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

        if (!_editCurrentStaffId) {
            showToast('Please search and select a staff member first.', 'error');
            searchInput.focus();
            return;
        }
        if (!validate()) {
            showToast('Please fix the highlighted fields.', 'error');
            return;
        }

        const count = parseInt(langCountHidden.value);
        const languages = [];
        for (let i = 1; i <= count; i++) {
            const box = langBoxesDiv.querySelector(`[name="edit_language_${i}"]`);
            if (box) languages.push(box.value.trim());
        }

        const updates = {
            firstName:          document.getElementById('edit_firstName').value.trim(),
            lastName:           document.getElementById('edit_lastName').value.trim(),
            dob:                document.getElementById('edit_dob').value,
            email:              document.getElementById('edit_email').value.trim(),
            gender:             document.getElementById('edit_gender').value,
            contact:            document.getElementById('edit_contact').value.trim(),
            reportingManagerId: document.getElementById('edit_reportingManagerId').value.trim(),
            languageCount:      count,
            languages,
            dateJoining:        document.getElementById('edit_dateJoining').value,
            counter:            document.getElementById('edit_counter').value.trim(),
            shiftStart:         document.getElementById('edit_shiftStart').value,
            shiftEnd:           document.getElementById('edit_shiftEnd').value,
        };

        const ok = StaffStore.update(_editCurrentStaffId, updates);
        if (ok) {
            showToast('Staff profile updated successfully!');
            setTimeout(() => { showPage('view'); }, 1500);
        } else {
            showToast('Update failed. Staff not found.', 'error');
        }
    });

    // Cancel
    document.getElementById('edit_cancelBtn').addEventListener('click', () => {
        if (confirm('Discard changes and go back?')) showPage('view');
    });
}

function buildEditLangBoxes(count, existingValues = []) {
    const langBoxesDiv    = document.getElementById('edit_languageBoxes');
    const langCountHidden = document.getElementById('edit_languageCountHidden');
    langBoxesDiv.innerHTML = '';
    langCountHidden.value = count;
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `edit_language_${i}`;
        input.placeholder = `Language ${i}`;
        input.className = 'language-box';
        input.value = existingValues[i - 1] || '';
        enforceSingleWord(input);
        langBoxesDiv.appendChild(input);
    }
}

function populateEditForm(member) {
    document.getElementById('edit_firstName').value          = member.firstName || '';
    document.getElementById('edit_lastName').value           = member.lastName  || '';
    document.getElementById('edit_dob').value                = member.dob       || '';
    document.getElementById('edit_email').value              = member.email     || '';
    document.getElementById('edit_gender').value             = member.gender    || '';
    document.getElementById('edit_contact').value            = member.contact   || '';
    document.getElementById('edit_reportingManagerId').value = member.reportingManagerId || '';
    document.getElementById('edit_dateJoining').value        = member.dateJoining || '';
    document.getElementById('edit_counter').value            = member.counter   || '';
    document.getElementById('edit_shiftStart').value         = member.shiftStart || '';
    document.getElementById('edit_shiftEnd').value           = member.shiftEnd  || '';

    const count = member.languageCount || (member.languages || []).length || 1;
    document.getElementById('edit_languageCount').value = count;
    buildEditLangBoxes(count, member.languages || []);

    _editCurrentStaffId = member.id;
}

function removeDropdown() {
    const d = document.getElementById('mb-dropdown');
    if (d) d.remove();
}

function buildDropdown(members) {
    removeDropdown();
    if (!members.length) return;

    const searchBox = document.getElementById('editSearchInput').closest('.search-box');
    searchBox.style.position = 'relative';

    const dropdown = document.createElement('ul');
    dropdown.id = 'mb-dropdown';
    Object.assign(dropdown.style, {
        position: 'absolute', top: 'calc(100% + 4px)', left: '0', right: '0',
        background: 'white', border: '2px solid #000', borderRadius: '0.5rem',
        listStyle: 'none', margin: '0', padding: '0.25rem 0',
        zIndex: '100', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxHeight: '200px', overflowY: 'auto',
    });

    members.forEach(m => {
        const li = document.createElement('li');
        li.textContent = StaffStore.fullName(m);
        Object.assign(li.style, {
            padding: '0.65rem 1rem', cursor: 'pointer',
            fontSize: '0.95rem', color: '#000', borderBottom: '1px solid #f3f4f6',
        });
        li.addEventListener('mouseenter', () => li.style.background = '#f0fdfb');
        li.addEventListener('mouseleave', () => li.style.background = 'white');
        li.addEventListener('mousedown', e => {
            e.preventDefault();
            populateEditForm(m);
            document.getElementById('editSearchInput').value = StaffStore.fullName(m);
            removeDropdown();
            showToast(`Loaded profile of ${StaffStore.fullName(m)}`);
        });
        dropdown.appendChild(li);
    });

    searchBox.appendChild(dropdown);
}


// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initViewPage();
    initAddPage();
    // Edit page init is deferred to showPage('edit') call to avoid re-init issues

    // Set max dates for add form (edit form uses lazy init)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('add_dob').max = today;
    document.getElementById('add_dateJoining').max = today;

    lucide.createIcons();
});
