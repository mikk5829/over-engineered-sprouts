var express = require('express')
var router = express.Router()
const db = require('../server/db/simple-db');

/**
 * API for manipulating db using http-requests useful for debugging
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
let add_loss = router.post('/add-loss', async(req, res) => {
    var user_name = req.body.name;

    var response = await db.addLoss(user_name);

    res.send('wins: ' + response.wins + ' losses: ' + response.losses);
});

/**
 * Gets all scores in db.
 * @memberOf Database API
 */
let get_scores = router.get('/get-scores', async(req, res) => {
    var response = await db.getAllScores();

    res.send(response);
})

/**
 * Removes all scores in db.
 * @memberOf Database API
 */
let remove_scores = router.get('/remove-scores', async(req, res) => {
    var response = await db.removeAllUsers();

    res.send(response);
})

module.exports = router;
