var express = require('express');
var router = express.Router();
const db = require('../public/scripts/db-scripts');

router.get('/', function(req, res, next) {
  res.send('You are about to go to db views');
});


router.post('/create-collection', function(req, res, next) {
  res.send(db.createCollection());
});

router.post('/create-test-user', function(req, res, next) {
  res.send(db.createTestUser());
});

router.post('/create-user', function(req, res) {
  var user_name = req.body.name;

  db.createUser(user_name,0,0);

  res.send("User with name " + user_name + " created");
});

module.exports = router;
