var express = require('express')
var router = express.Router()
const db = require('../server/db/simple-db')

router.post('/create-user', function(req, res) {
    var user_name = req.body.name;
    var user_wins = 0;
    var user_losses = 0;

    var response = db.createUser(user_name,user_wins,user_losses);

    res.send('wins: ' + response.wins + ' losses: ' + response.losses);
});

router.post('/add-win', function(req, res) {
    var user_name = req.body.name;

    var response = db.addWin(user_name);

    res.send('wins: ' + response.wins + ' losses: ' + response.losses);
});

router.post('/add-loss', function(req, res) {
    var user_name = req.body.name;

    var response = db.addLoss(user_name);

    res.send('wins: ' + response.wins + ' losses: ' + response.losses);
});

module.exports = router;
