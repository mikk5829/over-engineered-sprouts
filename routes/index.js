var express = require('express');
var router = express.Router();
var simpleDb = require('../server/db/simple-db')
require('dotenv').config();

/**
 * GET home page
 * @namespace Routes
 *
 */
router.get('/', async(req, res, next) => {
    var db = await simpleDb.getAllScores();
    res.render('index', {title: 'Sprouts', results: db});
});

router.get('/live', function(req, res, next) {
  res.send('YES I AM LIVE');
});

router.get('/game', function(req, res, next) {
  res.render('game', { title: 'Play Sprouts!' });
});

router.get('/customize', function(req, res, next) {
  res.render('customize', { title: 'Customize your game' });
});

module.exports = router;
