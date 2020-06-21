const JSONdb = require('simple-json-db');
let fs = require('fs');

/**
 * These functions are used to manipulate the simple database
 * @namespace Database
 * @author Mikkel Anderson
 * */

/**
 * Returns a new instance of JSONdb.
 * @memberOf Database
 * @returns {JSONdb}
 */
function createInstance() {
    global.filePath = __dirname + '/database.json';
    fs.statSync(global.filePath);
    return new JSONdb(global.filePath);
}

/**
 * Creates new user in database
 * @param {string} username
 * @param {number} userWins
 * @param {number} userLosses
 * @memberOf Database
 * @returns {Object}
 */
let createUser = exports.createUser = (username, userWins = 0, userLosses = 0) => {
    let db = createInstance();
    if (!db.has(username)) {
        const score = {
            'name': username,
            'wins': userWins,
            'losses': userLosses
        };

        db.set(username, score);
        return db.get(username);
    }
    return "user exists"
};

let changeUsername = exports.changeUsername = (oldUsername, newUsername) => {
    let db = createInstance();
    if (!db.has(oldUsername)) createUser(newUsername);
    else {
        let userScore = db.get(oldUsername);
        const score = {
            'name': newUsername,
            'wins': userScore.wins,
            'losses': userScore.losses
        };
        db.delete(oldUsername);
        db.set(newUsername, score);
    }
};

exports.addWin = (username) => {
    let db = createInstance();
    let userScore = db.get(username);
    const score = {
        'name': username,
        'wins': userScore.wins + 1,
        'losses': userScore.losses
    };

    db.set(username, score);
    return db.get(username);
};

exports.addLoss = (username) => {
    let db = createInstance();
    let user_score = db.get(username);
    const score = {
        'name': username,
        'wins': user_score.wins,
        'losses': user_score.losses + 1
    };

    db.set(username, score);
    return db.get(username);
};

exports.getAllScores = () => {
    let db = createInstance();
    return db.JSON();
};
