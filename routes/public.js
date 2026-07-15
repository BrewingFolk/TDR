const express = require('express');
const router = express.Router();
const dataStore = require('../lib/dataStore');

router.get('/', (req, res) => {
  const locations = dataStore.getLocations();
  res.render('index', {
    locations,
    submitted: req.query.submitted === '1',
    error: null,
    nameValue: '',
    selectedLocationId: '',
    questionValue: ''
  });
});

router.post('/questions', async (req, res) => {
  const name = (req.body.name || '').trim();
  const question = (req.body.question || '').trim();
  const locationId = (req.body.locationId || '').trim();
  const locations = dataStore.getLocations();
  const validLocation = locations.some((loc) => loc.id === locationId);

  if (!name || !question || !validLocation) {
    return res.status(400).render('index', {
      locations,
      submitted: false,
      error: 'Please enter your name, select a tour stop, and enter a question.',
      nameValue: name,
      selectedLocationId: locationId,
      questionValue: question
    });
  }

  await dataStore.addQuestion({ name, question, locationId });
  res.redirect('/?submitted=1');
});

module.exports = router;
