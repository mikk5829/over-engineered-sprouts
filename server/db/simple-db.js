const JSONdb = require('simple-json-db');
var fs = require('fs');
/**
 * These functions are used to manipulate the simple database
 * @namespace Database
 * @author Mikkel Anderson
 * */

/**
 * Returns a new instance of JSONdb.
 * @returns {JSONdb}
 */
function createInstance() {
    global.filePath = __dirname + '/database.json';
    fs.statSync(global.filePath);
    return new JSONdb(global.filePath);
}

/**
 * Creates new user in database
 * @param {string} user_name
 * @param {number} user_wins
 * @param {number} user_losses
 * @memberOf Database
 * @returns {Object}
 */
var createUser = exports.createUser = (user_name, user_wins, user_losses) => {
    var db = createInstance();
    const score = {
        'wins': user_wins,
        'losses': user_losses
    }

    db.set(user_name, score);
    return db.get(user_name);
}

exports.addWin = (user_name) => {
    var db = createInstance();
    // if (!db.has(user_name)) {
    //     createUser(user_name,0,0)
    // }
    let user_score = db.get(user_name);
    const score = {
        'wins': user_score.wins + 1,
        'losses': user_score.losses
    }

    db.set(user_name, score);
    return db.get(user_name);
}

exports.addLoss = (user_name) => {
    var db = createInstance();
    // if (!db.has(user_name)) {
    //     createUser(user_name,0,0)
    // }
    let user_score = db.get(user_name);
    const score = {
        'wins': user_score.wins,
        'losses': user_score.losses + 1
    }

    db.set(user_name, score);
    return db.get(user_name);
}
