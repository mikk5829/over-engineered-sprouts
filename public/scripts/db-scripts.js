require('dotenv').config();
console.log(process.env.MONGO_DB);
var url = process.env.MONGO_DB;
var MongoClient = require('mongodb').MongoClient;
var dbName = "sprouts";
var collection = "users";

exports.createCollection = () => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.createCollection(collection, function(err, res) {
            if (err) throw err;
            console.log("Collection created!");
            db.close();
        });
    });
};

exports.createTestUser = () => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        var testUser = { name: "Test Test", wins: 20, losses: 14 };
        dbo.collection(collection).insertOne(testUser, function(err, res) {
            if (err) throw err;
            console.log("1 user added");
            db.close();
        });
    });
};

exports.createUser = (userName, userWins, userLosses) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        var testUser = { name: userName, wins: userWins, losses: userLosses };
        dbo.collection(collection).insertOne(testUser, function(err, res) {
            if (err) throw err;
            console.log("1 user added");
            db.close();
        });
    });
};