const TIMES = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
const BOOKED = ["10:00 AM", "01:00 PM"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const AVAIL_COUNTS = [6, 5, 7, 4, 6, 2, 0];

let selectedSlots = [];

function renderSlots() {
  const date = document.getElementById("slotDate").value;
  if (!date) return;

  const formatted = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  document.getElementById("slotsTitle").textContent = `Manage Slots for ${formatted}`;

  document.getElementById("slotsGrid").innerHTML = TIMES.map((time) => {
    const isBooked = BOOKED.includes(time);
    const isSelected = selectedSlots.includes(time);
    const state = isBooked ? "booked" : isSelected ? "selected" : "available";
    const statusText = isBooked ? "Booked" : isSelected ? "Selected" : "Available";

    return `
      <button class="slot-btn ${state}" onclick="toggleSlot('${time}', this)" ${isBooked ? "disabled" : ""}>
        <div class="time">${time}</div>
        <div class="status">${statusText}</div>
      </button>
    `;
  }).join("");
}

function toggleSlot(time, element) {
  if (selectedSlots.includes(time)) {
    selectedSlots = selectedSlots.filter((slot) => slot !== time);
    element.classList.remove("selected");
    element.classList.add("available");
    element.querySelector(".status").textContent = "Available";
  } else {
    selectedSlots.push(time);
    element.classList.remove("available");
    element.classList.add("selected");
    element.querySelector(".status").textContent = "Selected";
  }
}

function markUnavail() {
  const date = document.getElementById("unavailDate").value;
  if (!date) return;

  alert(`Date ${date} marked as unavailable.`);
  document.getElementById("unavailDate").value = "";
}

function renderWeek() {
  const colors = ["#3a9657", "#2d7a47", "#4db870", "#f59e0b", "#3a9657", "#e5e7eb", "#f3f4f6"];

  document.getElementById("weekGrid").innerHTML = DAYS.map(
    (day, index) => `
      <div class="day-col ${index === 2 ? "today" : ""}">
        <div class="day-name">${day}</div>
        <div class="day-dot" style="background:${colors[index]}"></div>
        <div class="day-count">${AVAIL_COUNTS[index]} slots</div>
      </div>
    `
  ).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderDoctorPortal("slots");
  document.getElementById("slotDate").value = new Date().toISOString().split("T")[0];
  renderSlots();
  renderWeek();
});
