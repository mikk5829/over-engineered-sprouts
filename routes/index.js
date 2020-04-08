var express = require('express');


var router = express.Router();
require('dotenv').config();
var url = process.env.MONGO_DB;
var MongoClient = require('mongodb').MongoClient;
var dbName = process.env.MONGO_DBO;
var collection = process.env.MONGO_COLLECTION_USERS;

/**
 * @namespace routes
 * GET home page
 */
router.get('/', function (req, res, next) {
    res.render('index2', {title: 'Sprouts'});
});

router.get('/live', function (req, res, next) {
    res.send('YES I AM LIVE');
});

router.get('/game', function (req, res, next) {
    res.render('game', {title: 'Play Sprouts!'});
});

router.get('/customize', function (req, res, next) {
    res.render('customize', {title: 'Customize your game'});
});

router.get(/game/, function(req,res) {
    console.log(req);
    console.log(res);
    res.render('game',{title: 'Game'});
});

/**
 * @memberOf routes
 * GET scores from db
 */
router.get('/scoreboard', function (req, res, next) {
    let results_from_mongo = [];

    MongoClient.connect(url)
        .then(function (client) {
            const db = client.db(dbName);
            var cursor = db.collection(collection).find({});

            function iterateFunc(doc) {
                results_from_mongo.push(doc); // adds scores to array
            }

            function errorFunc(error) {
                console.log(error);
            }

            cursor.forEach(iterateFunc, errorFunc);

            client.close().then(r => {
                res.render('scoreboard', {"results": results_from_mongo}); // renders scoreboard with data
            });
        })
        .catch(function (err) {
            res.render('scoreboard', {"results": results_from_mongo}); // renders scoreboard with no data
            console.log(err);
        })

});

module.exports = router;