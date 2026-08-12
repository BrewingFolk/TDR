const express = require('express');
const router = express.Router();
const dataStore = require('../lib/dataStore');

router.get('/', (req, res) => {
  const locations = dataStore.getLocations();
  const selectedLocationId = locations.some((loc) => loc.id === req.query.locationId)
    ? req.query.locationId
    : '';

  res.render('index', {
    locations,
    submitted: req.query.submitted === '1',
    error: null,
    nameValue: '',
    selectedLocationId,
    questionValue: ''
  });
});

router.post('/questions', async (req, res) => {
  const name = (req.body.name || '').trim();
  const question = (req.body.question || '').trim();
  const locationId = (req.body.locationId || '').trim();
  const locations = dataStore.getLocations();
  const validLocation = locations.some((loc) => loc.id === locationId);

  if (!validLocation) {
    return res.status(400).render('index', {
      locations,
      submitted: false,
      error: 'Please select a tour stop.',
      nameValue: name,
      selectedLocationId: locationId,
      questionValue: question
    });
  }

  if (!question) {
    return res.redirect(`/?locationId=${encodeURIComponent(locationId)}`);
  }

  await dataStore.addQuestion({ name, question, locationId });
  res.redirect(`/?submitted=1&locationId=${encodeURIComponent(locationId)}`);
});

module.exports = router;
