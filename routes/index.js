var express = require('express');
var router = express.Router();
require('dotenv').config();

/**
 * @namespace routes
 * GET home page
 */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Sprouts'});
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
