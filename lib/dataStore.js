const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

const DEFAULT_CONTENT = {
  eyebrow: 'Verdant Brewing Co. × The Designers Republic™',
  title: '40 Years of TDR™ Tour',
  subtitle: 'Provoke response, create dialogue.',
  copy: 'Ian Anderson founded The Designers Republic in Sheffield in 1986 — no portfolio, no plan, just a knack for making things happen. Forty years on, we’re taking that legacy on the road: pints in hand, stories from four decades in the creative industry, hosted by Verdant’s Matthew Shaw.',
  meta: 'Autumn 2026. Ten venues. Ask your question before the night.'
};

// Serializes writes per-file so concurrent requests can't clobber each other.
const writeQueues = new Map();

function queueWrite(file, task) {
  const previous = writeQueues.get(file) || Promise.resolve();
  const next = previous.then(task, task);
  writeQueues.set(file, next.catch(() => {}));
  return next;
}

function readJson(file, defaultValue) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(defaultValue));
  }
  const raw = fs.readFileSync(file, 'utf8');
  return raw ? JSON.parse(raw) : defaultValue;
}

function writeJson(file, data) {
  return queueWrite(file, () =>
    fs.promises.writeFile(file, JSON.stringify(data, null, 2))
  );
}

function makeId() {
  return crypto.randomBytes(8).toString('hex');
}

function getQuestions() {
  return readJson(QUESTIONS_FILE, []);
}

function addQuestion({ name, question, locationId }) {
  const questions = getQuestions();
  const entry = {
    id: makeId(),
    name,
    question,
    locationId,
    createdAt: new Date().toISOString()
  };
  questions.unshift(entry);
  return writeJson(QUESTIONS_FILE, questions).then(() => entry);
}

function deleteQuestion(id) {
  const questions = getQuestions();
  const remaining = questions.filter((q) => q.id !== id);
  return writeJson(QUESTIONS_FILE, remaining);
}

function getLocations() {
  const locations = readJson(LOCATIONS_FILE, []);
  return locations.slice().sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

function addLocation(name, ticketUrl, date) {
  const locations = getLocations();
  const entry = { id: makeId(), name, ticketUrl: ticketUrl || '', date: date || '' };
  locations.push(entry);
  return writeJson(LOCATIONS_FILE, locations).then(() => entry);
}

function updateLocation(id, name, ticketUrl, date) {
  const locations = getLocations();
  const location = locations.find((loc) => loc.id === id);
  if (!location) return Promise.resolve(null);
  location.name = name;
  location.ticketUrl = ticketUrl || '';
  location.date = date || '';
  return writeJson(LOCATIONS_FILE, locations).then(() => location);
}

function deleteLocation(id) {
  const locations = getLocations();
  const remaining = locations.filter((loc) => loc.id !== id);
  return writeJson(LOCATIONS_FILE, remaining);
}

function getContent() {
  const content = readJson(CONTENT_FILE, DEFAULT_CONTENT);
  return { ...DEFAULT_CONTENT, ...content };
}

function updateContent(fields) {
  const updated = { ...getContent(), ...fields };
  return writeJson(CONTENT_FILE, updated).then(() => updated);
}

module.exports = {
  getQuestions,
  addQuestion,
  deleteQuestion,
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  getContent,
  updateContent
};
