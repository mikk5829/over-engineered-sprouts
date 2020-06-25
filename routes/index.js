var express = require('express');
var router = express.Router();
var simpleDb = require('../server/db/simple-db')
require('dotenv').config();

/**
 * HTTP API for node.js and manipulating website
 * @namespace Routes
 * @author Mikkel Anderson & Laura Hansen & Benjamin Starostka & Wictor Jensen
 */

/**
 * Returns a new instance of JSONdb. Also adds database.json if it does not exist
 * @memberOf Routes
 * @returns {JSONdb}
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
