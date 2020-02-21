var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to da server' });
});

router.get('/live', function(req, res, next) {
  res.send('YES I AM LIVE');
});

module.exports = router;
