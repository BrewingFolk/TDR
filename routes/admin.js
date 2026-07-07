const express = require('express');
const router = express.Router();
const dataStore = require('../lib/dataStore');
const { requireAuth } = require('../middleware/auth');

router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.status(401).render('admin/login', { error: 'Incorrect password.' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

router.get('/', requireAuth, (req, res) => {
  const questions = dataStore.getQuestions();
  const locations = dataStore.getLocations();
  const locationNames = {};
  locations.forEach((loc) => {
    locationNames[loc.id] = loc.name;
  });
  res.render('admin/dashboard', { questions, locationNames });
});

router.get('/locations', requireAuth, (req, res) => {
  res.render('admin/locations', { locations: dataStore.getLocations(), error: null });
});

router.post('/locations', requireAuth, async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).render('admin/locations', {
      locations: dataStore.getLocations(),
      error: 'Location name is required.'
    });
  }
  await dataStore.addLocation(name);
  res.redirect('/admin/locations');
});

router.post('/locations/:id/edit', requireAuth, async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).render('admin/locations', {
      locations: dataStore.getLocations(),
      error: 'Location name is required.'
    });
  }
  await dataStore.updateLocation(req.params.id, name);
  res.redirect('/admin/locations');
});

router.post('/locations/:id/delete', requireAuth, async (req, res) => {
  await dataStore.deleteLocation(req.params.id);
  res.redirect('/admin/locations');
});

module.exports = router;
