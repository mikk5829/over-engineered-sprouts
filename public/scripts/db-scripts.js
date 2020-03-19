require('dotenv').config();
console.log(process.env.MONGO_DB);
var url = process.env.MONGO_DB;
var MongoClient = require('mongodb').MongoClient;
var dbName = "sprouts";
var collection = "users";

exports.getAllUsers = () => {
    MongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
        .then(() => console.log('DB Connected!'))
        .catch(err => {
            console.log("DB Connection Error: " + err);
        });
/*    let users;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection(collection).find({}).toArray(function(err, result) {
            if (err) throw err;
            users = result;
            db.close();
        });
        return users;
    });*/
};

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