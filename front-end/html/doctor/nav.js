// Shared nav renderer
const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',          href: 'index.html',       icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
  { id: 'profile',       label: 'Profile',             href: '#',                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>` },
  { id: 'consultation',  label: 'Consultation Notes',  href: 'consultation.html',icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>` },
  { id: 'referral',      label: 'Internal Referral',   href: '#',                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id: 'labtest',       label: 'Lab Test',             href: 'labtest.html',     icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M19 3h-4"/><path d="M3 9l9 9 9-9"/><path d="M9 21H5a2 2 0 0 1-2-2v-4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/></svg>` },
  { id: 'treatment',     label: 'Treatment Plan',       href: 'treatment.html',   icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  { id: 'slots',         label: 'Slot Management',      href: 'slots.html',       icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { id: 'logout',        label: 'Logout',               href: '#',                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>` },
];

function renderSidebar(activeId) {
  const sidebar = document.getElementById('sidebar');
  const mainItems = NAV_ITEMS.filter(i => i.id !== 'logout');
  const logoutItem = NAV_ITEMS.find(i => i.id === 'logout');

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-name">MedBits</div>
      <div class="logo-sub">Doctor Portal</div>
    </div>
    <nav class="sidebar-nav">
      ${mainItems.map(item => `
        <a href="${item.href}" class="nav-item ${item.id === activeId ? 'active' : ''}">
          ${item.icon}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <a href="#" class="nav-item">
        ${logoutItem.icon}
        <span>Logout</span>
      </a>
    </div>
  `;
}
