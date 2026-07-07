const express = require('express');
const router = express.Router();
const dataStore = require('../lib/dataStore');

router.get('/', (req, res) => {
  const locations = dataStore.getLocations();
  res.render('index', {
    locations,
    submitted: req.query.submitted === '1',
    error: null,
    selectedLocationId: '',
    questionValue: ''
  });
});

router.post('/questions', async (req, res) => {
  const question = (req.body.question || '').trim();
  const locationId = (req.body.locationId || '').trim();
  const locations = dataStore.getLocations();
  const validLocation = locations.some((loc) => loc.id === locationId);

  if (!question || !validLocation) {
    return res.status(400).render('index', {
      locations,
      submitted: false,
      error: 'Please select a location and enter a question.',
      selectedLocationId: locationId,
      questionValue: question
    });
  }

  await dataStore.addQuestion({ question, locationId });
  res.redirect('/?submitted=1');
});

module.exports = router;
