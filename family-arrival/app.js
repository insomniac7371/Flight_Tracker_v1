const STORAGE_KEY = "family-arrival-v1";

const statuses = [
  "Planned",
  "Leaving",
  "At airport",
  "Parked",
  "Arrivals",
  "Picked up",
  "Delayed",
  "Need help"
];

const checklistItems = [
  "Confirm arrival time",
  "Text traveler",
  "Bring ID / pass",
  "Medication bag",
  "Wheelchair assistance",
  "Check baggage claim",
  "Save parking spot",
  "Send picked-up text"
];

const defaultState = {
  travelerName: "",
  flightNumber: "",
  airline: "",
  arrivalAirport: "",
  arrivalTime: "",
  pickupPerson: "",
  pickupAddress: "",
  notes: "",
  status: "Planned",
  location: null,
  checked: {},
  photos: []
};

let state = loadState();
let deferredInstallPrompt = null;

const formFields = [
  "travelerName",
  "flightNumber",
  "airline",
  "arrivalAirport",
  "arrivalTime",
  "pickupPerson",
  "pickupAddress",
  "notes"
];

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState, ...stored };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatArrival(value) {
  if (!value) return "Arrival time not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function renderHero() {
  const flight = state.flightNumber || "No flight set";
  const traveler = state.travelerName || "Create a pickup board";
  const airport = state.arrivalAirport || "Airport not set";
  document.querySelector("#heroFlight").textContent = flight;
  document.querySelector("#heroTraveler").textContent = traveler;
  document.querySelector("#heroMeta").textContent = `${airport} - ${formatArrival(state.arrivalTime)}`;
  document.querySelector("#heroStatus").textContent = state.status;
}

function renderForm() {
  for (const field of formFields) {
    document.querySelector(`#${field}`).value = state[field] || "";
  }
}

function renderStatuses() {
  const grid = document.querySelector("#statusGrid");
  grid.innerHTML = "";
  for (const status of statuses) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = status;
    button.className = status === state.status ? "active" : "";
    button.addEventListener("click", () => {
      state.status = status;
      saveState();
      render();
    });
    grid.appendChild(button);
  }
}

function renderChecklist() {
  const container = document.querySelector("#checklist");
  container.innerHTML = "";
  for (const item of checklistItems) {
    const label = document.createElement("label");
    label.className = "check-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(state.checked[item]);
    checkbox.addEventListener("change", () => {
      state.checked[item] = checkbox.checked;
      saveState();
    });
    const span = document.createElement("span");
    span.textContent = item;
    label.append(checkbox, span);
    container.appendChild(label);
  }
}

function renderPhotos() {
  const grid = document.querySelector("#photoGrid");
  grid.innerHTML = "";
  if (!state.photos.length) {
    const empty = document.createElement("p");
    empty.className = "quiet";
    empty.textContent = "Ticket, baggage, meds, parking, or pickup landmark photos stay on this device.";
    grid.appendChild(empty);
    return;
  }
  for (const src of state.photos) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = "Trip attachment";
    grid.appendChild(image);
  }
}

function renderLocation() {
  const readout = document.querySelector("#locationReadout");
  if (!state.location) {
    readout.textContent = "No location saved yet.";
    return;
  }
  readout.textContent = `Saved spot: ${state.location.lat.toFixed(5)}, ${state.location.lon.toFixed(5)}`;
}

function render() {
  renderHero();
  renderForm();
  renderStatuses();
  renderChecklist();
  renderPhotos();
  renderLocation();
}

function buildStatusMessage() {
  const traveler = state.travelerName || "Traveler";
  const flight = state.flightNumber || "flight";
  const airport = state.arrivalAirport || "the airport";
  const pickup = state.pickupPerson || "pickup person";
  return `${traveler} ${flight} status: ${state.status}. Arrival: ${formatArrival(state.arrivalTime)} at ${airport}. Pickup: ${pickup}.`;
}

document.querySelector("#tripForm").addEventListener("submit", (event) => {
  event.preventDefault();
  for (const field of formFields) {
    state[field] = document.querySelector(`#${field}`).value.trim();
  }
  saveState();
  render();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}Panel`).classList.add("active");
  });
});

document.querySelector("#shareStatusButton").addEventListener("click", async () => {
  const text = buildStatusMessage();
  if (navigator.share) {
    await navigator.share({ text });
    return;
  }
  await navigator.clipboard.writeText(text);
  alert("Status copied.");
});

document.querySelector("#mapButton").addEventListener("click", () => {
  const target = encodeURIComponent(state.pickupAddress || state.arrivalAirport || "airport arrivals");
  window.location.href = `https://www.google.com/maps/search/?api=1&query=${target}`;
});

document.querySelector("#gpsButton").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("GPS is not available in this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        capturedAt: new Date().toISOString()
      };
      saveState();
      renderLocation();
    },
    () => alert("Location permission was denied or unavailable."),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

document.querySelector("#notifyButton").addEventListener("click", async () => {
  if (!("Notification" in window)) {
    alert("Notifications are not supported in this browser.");
    return;
  }
  const permission = Notification.permission === "granted"
    ? "granted"
    : await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notification permission was not granted.");
    return;
  }
  new Notification("Family Arrival reminder", {
    body: buildStatusMessage()
  });
});

document.querySelector("#resetChecklistButton").addEventListener("click", () => {
  state.checked = {};
  saveState();
  renderChecklist();
});

document.querySelector("#photoInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.photos = [reader.result, ...state.photos].slice(0, 8);
    saveState();
    renderPhotos();
    event.target.value = "";
  });
  reader.readAsDataURL(file);
});

document.querySelector("#installButton").addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    alert("Use your browser menu to add this app to the home screen.");
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}

render();
