var express = require('express')
var router = express.Router()
const db = require('../server/db/simple-db')

/**
 * API for manipulating db using http-requests
 * @namespace Database API
 * @author Mikkel Anderson
 */

/**
 * Creates new user in db.
 * @memberOf Database API
 */
let create_user = router.post('/create-user', function(req, res) {
    var user_name = req.body.name;
    var user_wins = 0;
    var user_losses = 0;

    var response = db.createUser(user_name,user_wins,user_losses);

    res.send('wins: ' + response.wins + ' losses: ' + response.losses);
});

/**
 * Adds win to user.
 * @memberOf Database API
 */
let add_win = router.post('/add-win', function(req, res) {
    var user_name = req.body.name;

    var response = db.addWin(user_name);

    res.send('wins: ' + response.wins + ' losses: ' + response.losses);
});

/**
 * Adds loss to user.
 * @memberOf Database API
 */
let add_loss = router.post('/add-loss', function(req, res) {
    var user_name = req.body.name;

    var response = db.addLoss(user_name);

    res.send('wins: ' + response.wins + ' losses: ' + response.losses);
});

/**
 * Gets all scores in db.
 * @memberOf Database API
 */
let get_scores = router.get('/get-scores', function(req, res) {
    var response = db.getAllScores();

    res.send(response);
})

module.exports = router;
