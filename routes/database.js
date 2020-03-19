var express = require('express');
var router = express.Router();
const db = require('../public/scripts/db-scripts');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/create-collection', function(req, res, next) {
  res.send(db.createCollection());
});

router.get('/create-test-user', function(req, res, next) {
  res.send(db.createTestUser());
});


module.exports = router;
