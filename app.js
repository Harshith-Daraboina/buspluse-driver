const drivers = ['Ramesh Patil', 'Suresh Kumar', 'Prakash Desai', 'Anil Kulkarni', 'Mahesh Naik', 'Vinay Hegde'];
const routes = [
  { id: 'IIIT-R01', stops: ['IIIT Dharwad Campus', 'Chirayu', 'Transit Hostel'] },
  { id: 'IIIT-R02', stops: ['Transit Hostel', 'Chirayu', 'IIIT Dharwad Campus'] },
  { id: 'IIIT-R03', stops: ['IIIT Dharwad Campus', 'Chirayu', 'Sattur', 'Shivaji Hostel'] },
  { id: 'IIIT-R04', stops: ['Shivaji Hostel', 'Sattur', 'Chirayu', 'IIIT Dharwad Campus'] },
  { id: 'IIIT-R05', stops: ['Transit Hostel', 'Chirayu', 'Sattur', 'Shivaji Hostel'] },
  { id: 'IIIT-R06', stops: ['Shivaji Hostel', 'Sattur', 'Chirayu', 'Transit Hostel'] },
];
const buses = ['AB', 'CD', 'EF', 'GH', 'JK', 'LM'].map((series, index) => ({
  id: `BUS00${index + 1}`,
  label: `Bus ${String(index + 1).padStart(2, '0')} - KA 25 ${series} ${1234 + index * 111}`,
}));
const storageKey = 'campusride-driver-v1';
const driverSelect = document.querySelector('#driver');
const routeSelect = document.querySelector('#route');
const busSelect = document.querySelector('#bus');
const feedback = document.querySelector('#feedback');
const endDialog = document.querySelector('#end-dialog');
const sosDialog = document.querySelector('#sos-dialog');
let activeJourney = null;
let storageAvailable = true;

function routeName(route) {
  return `${route.stops[0]} to ${route.stops.at(-1)}`;
}

function populate(select, options) {
  for (const option of options) select.add(new Option(option.label, option.id));
}

populate(driverSelect, drivers.map(name => ({ id: name, label: name })));
populate(routeSelect, routes.map(route => ({ id: route.id, label: routeName(route) })));
populate(busSelect, buses);
document.querySelector('#date-label').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ driver: driverSelect.value, route: routeSelect.value, bus: busSelect.value, activeJourney }));
  } catch {
    storageAvailable = false;
    feedback.textContent = 'Device storage is unavailable. Keep this page open to retain your journey.';
  }
}

function renderRoute() {
  const route = routes.find(item => item.id === routeSelect.value);
  document.querySelector('#route-preview').hidden = !route;
  document.querySelector('#stops').replaceChildren(...(route?.stops ?? []).map(stop => {
    const item = document.createElement('li');
    item.textContent = stop;
    return item;
  }));
}

function updateTimer() {
  if (!activeJourney) return;
  const seconds = Math.max(0, Math.floor((Date.now() - activeJourney.startedAt) / 1000));
  document.querySelector('#elapsed').textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
  document.querySelector('#elapsed').dateTime = `PT${seconds}S`;
}

function renderJourney() {
  const active = Boolean(activeJourney);
  document.querySelector('#selection-fields').disabled = active;
  document.querySelector('#journey-live').hidden = !active;
  document.querySelector('#status').textContent = active ? 'On the road' : 'Not started';
  document.querySelector('#status').classList.toggle('active', active);
  document.querySelector('#journey-button').classList.toggle('ending', active);
  document.querySelector('#journey-button-label').textContent = active ? 'End journey' : 'Start journey';
  document.querySelector('#journey-button-icon').innerHTML = active ? '&#9632;' : '&#8594;';
  if (active) document.querySelector('#started').textContent = `Started at ${new Date(activeJourney.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  updateTimer();
  renderRoute();
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (saved && drivers.includes(saved.driver) && routes.some(route => route.id === saved.route) && buses.some(bus => bus.id === saved.bus)) {
    driverSelect.value = saved.driver;
    routeSelect.value = saved.route;
    busSelect.value = saved.bus;
    if (Number.isFinite(saved.activeJourney?.startedAt) && saved.activeJourney.startedAt > 0 && saved.activeJourney.startedAt <= Date.now()) {
      activeJourney = { startedAt: saved.activeJourney.startedAt };
    }
  }
} catch {
  feedback.textContent = 'Saved details could not be restored. Choose your journey details again.';
}

document.querySelector('#journey-form').addEventListener('change', () => {
  renderRoute();
  persist();
});

document.querySelector('#journey-form').addEventListener('submit', event => {
  event.preventDefault();
  if (activeJourney) {
    endDialog.showModal();
    return;
  }
  if (!drivers.includes(driverSelect.value) || !routes.some(route => route.id === routeSelect.value) || !buses.some(bus => bus.id === busSelect.value)) return;
  activeJourney = { startedAt: Date.now() };
  feedback.textContent = 'Journey started. Drive safely.';
  persist();
  renderJourney();
});

document.querySelector('#keep-driving').addEventListener('click', () => endDialog.close());
document.querySelector('#confirm-end').addEventListener('click', () => {
  if (!activeJourney) return;
  const minutes = Math.max(1, Math.round((Date.now() - activeJourney.startedAt) / 60000));
  activeJourney = null;
  endDialog.close();
  feedback.textContent = `Journey completed. ${minutes} min on the road. Ready for your next trip.`;
  persist();
  renderJourney();
});

document.querySelector('#sos-button').addEventListener('click', () => {
  const route = routes.find(item => item.id === routeSelect.value);
  const details = [
    ['Driver', driverSelect.value || 'Not selected'],
    ['Bus', buses.find(bus => bus.id === busSelect.value)?.label || 'Not selected'],
    ['Route', route ? routeName(route) : 'Not selected'],
  ];
  document.querySelector('#emergency-details').replaceChildren(...details.flatMap(([label, value]) => {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    return [term, description];
  }));
  sosDialog.showModal();
});
document.querySelector('#close-sos').addEventListener('click', () => sosDialog.close());
window.addEventListener('pageshow', () => { if (storageAvailable) updateTimer(); });
setInterval(updateTimer, 1000);
renderJourney();