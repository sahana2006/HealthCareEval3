const DOCTOR_INFO = {
  initials: "SJ",
  name: "Dr. Sarah Johnson",
  role: "Consultant Physician",
};

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "index.html",
    title: "Dashboard",
    subtitle: "Doctor Portal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  },
  {
    id: "consultation",
    label: "Consultation Notes",
    href: "consultation.html",
    title: "Consultation Notes",
    subtitle: "Doctor Portal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`,
  },
  {
    id: "referral",
    label: "Internal Referral",
    href: "referral.html",
    title: "Internal Referral",
    subtitle: "Doctor Portal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 8h6"/><path d="M18 5l3 3-3 3"/><path d="M9 12H3"/><path d="M6 9l-3 3 3 3"/><path d="M7 5h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H7"/></svg>`,
  },
  {
    id: "labtest",
    label: "Lab Tests",
    href: "labtest.html",
    title: "Lab Test Package Creation",
    subtitle: "Doctor Portal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M19 3h-4"/><path d="M3 9l9 9 9-9"/><path d="M9 21H5a2 2 0 0 1-2-2v-4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/></svg>`,
  },
  {
    id: "treatment",
    label: "Treatment Plans",
    href: "treatment.html",
    title: "Treatment Plan",
    subtitle: "Doctor Portal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    id: "slots",
    label: "Slot Management",
    href: "slots.html",
    title: "Slot Management",
    subtitle: "Doctor Portal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  },
  {
    id: "profile",
    label: "Doctor Profile",
    href: "profile.html",
    title: "Doctor Profile",
    subtitle: "Doctor Portal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c1.8-3.6 4.5-5.4 8-5.4s6.2 1.8 8 5.4"></path></svg>`,
  },
];

const COMPONENT_FALLBACKS = {
  sidebar: `
    <div class="sidebar-logo">
      <div class="logo-name">MedBits</div>
      <div class="logo-sub">Doctor Portal</div>
    </div>
    <div class="sidebar-section-label">Workspace</div>
    <nav class="sidebar-nav" data-sidebar-nav></nav>
    <div class="sidebar-footer">
      <div class="sidebar-doctor-card" data-doctor-card></div>
      <a class="nav-item" data-logout-link href="../../login.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Logout</span>
      </a>
    </div>
  `,
  navbar: `
    <div class="topbar-title" data-topbar-title></div>
    <div class="topbar-right">
      <button class="icon-btn" type="button" aria-label="Notifications">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </button>
      <a class="doctor-info" data-topbar-doctor href="profile.html"></a>
    </div>
  `,
};

function getActivePage(activeId) {
  return NAV_ITEMS.find((item) => item.id === activeId) || NAV_ITEMS[0];
}

function doctorCardMarkup() {
  return `
    <div class="avatar">${DOCTOR_INFO.initials}</div>
    <div>
      <div class="name">${DOCTOR_INFO.name}</div>
      <div class="role">${DOCTOR_INFO.role}</div>
    </div>
  `;
}

function doctorTopbarMarkup() {
  return `
    <div class="avatar">${DOCTOR_INFO.initials}</div>
    <div>
      <div class="name">${DOCTOR_INFO.name}</div>
      <div class="role">${DOCTOR_INFO.role}</div>
    </div>
  `;
}

function clearDoctorSession() {
  localStorage.removeItem("medbits_session");
  localStorage.removeItem("medbits_selected_patient");
  localStorage.removeItem("medbits_selected_specialty");
  localStorage.removeItem("medbits_selected_doctor");
}

async function loadComponent(target, componentName) {
  if (!target) return;

  const componentPath = `components/${componentName}.html`;

  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
    target.innerHTML = await response.text();
  } catch (error) {
    target.innerHTML = COMPONENT_FALLBACKS[componentName];
  }
}

function populateSidebar(sidebar, activeId) {
  const nav = sidebar.querySelector("[data-sidebar-nav]");
  const doctorCard = sidebar.querySelector("[data-doctor-card]");
  const logoutLink = sidebar.querySelector("[data-logout-link]");

  if (nav) {
    nav.innerHTML = NAV_ITEMS.map(
      (item) => `
        <a href="${item.href}" class="nav-item ${item.id === activeId ? "active" : ""}">
          ${item.icon}
          <span>${item.label}</span>
        </a>
      `
    ).join("");
  }

  if (doctorCard) {
    doctorCard.innerHTML = doctorCardMarkup();
  }

  if (logoutLink) {
    logoutLink.setAttribute("href", "../login.html");
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      clearDoctorSession();
      window.location.replace("../login.html");
    });
  }
}

function populateTopbar(topbar, activeId) {
  const activePage = getActivePage(activeId);
  const title = topbar.querySelector("[data-topbar-title]");
  const doctor = topbar.querySelector("[data-topbar-doctor]");

  if (title) {
    title.innerHTML = `
      <h1>${activePage.title}</h1>
      <p>${activePage.subtitle}</p>
    `;
  }

  if (doctor) {
    doctor.setAttribute("href", "profile.html");
    doctor.innerHTML = doctorTopbarMarkup();
  }
}

async function renderDoctorPortal(activeId) {
  const sidebar = document.getElementById("sidebar");
  const topbar = document.getElementById("doctor-topbar");

  await Promise.all([
    loadComponent(sidebar, "sidebar"),
    loadComponent(topbar, "navbar"),
  ]);

  populateSidebar(sidebar, activeId);
  populateTopbar(topbar, activeId);
}
