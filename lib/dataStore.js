const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');

// Serializes writes per-file so concurrent requests can't clobber each other.
const writeQueues = new Map();

function queueWrite(file, task) {
  const previous = writeQueues.get(file) || Promise.resolve();
  const next = previous.then(task, task);
  writeQueues.set(file, next.catch(() => {}));
  return next;
}

function readJson(file) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '[]');
  }
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw || '[]');
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
  return readJson(QUESTIONS_FILE);
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
  return readJson(LOCATIONS_FILE);
}

function addLocation(name) {
  const locations = getLocations();
  const entry = { id: makeId(), name };
  locations.push(entry);
  return writeJson(LOCATIONS_FILE, locations).then(() => entry);
}

function updateLocation(id, name) {
  const locations = getLocations();
  const location = locations.find((loc) => loc.id === id);
  if (!location) return Promise.resolve(null);
  location.name = name;
  return writeJson(LOCATIONS_FILE, locations).then(() => location);
}

function deleteLocation(id) {
  const locations = getLocations();
  const remaining = locations.filter((loc) => loc.id !== id);
  return writeJson(LOCATIONS_FILE, remaining);
}

module.exports = {
  getQuestions,
  addQuestion,
  deleteQuestion,
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation
};
