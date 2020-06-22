const JSONdb = require('simple-json-db');
let fs = require('fs');

/**
 * These functions are used to manipulate the simple database, all functions are async
 * to make sure bigger databases are supported
 * @namespace Database
 * @author Mikkel Anderson
 * */

/**
 * Returns a new instance of JSONdb. Also adds database.json if it does not exist
 * @memberOf Database
 * @returns {JSONdb}
 */
async function createInstance() {
    global.filePath = __dirname + '/database.json';
    await fs.writeFile(global.filePath, "", {flag: 'wx'}, function (err) {
    });
    fs.statSync(global.filePath);
    return new JSONdb(global.filePath);
}

/**
 * Creates new user in database
 * @memberOf Database
 * @returns {Object}
 * @param user_name
 * @param user_wins
 * @param user_losses
 */
let createUser = exports.createUser = async (user_name, user_wins, user_losses) => {
    var db = await createInstance();
    if (!db.has(user_name)) {
        const score = {
            'name': user_name,
            'wins': user_wins,
            'losses': user_losses
        };

        db.set(user_name, score);
        return db.get(user_name);
    }
    return "user exists"
};

let changeUsername = exports.changeUsername = async (oldUsername, newUsername) => {
    let db = await createInstance();
    if (!db.has(oldUsername)) await createUser(newUsername);
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
}
/**
 * Adds win to specific user
 * @param {string} user_name
 * @memberOf Database
 * @returns {Object}
 */
exports.addWin = async (user_name) => {
    let db = await createInstance();
    let user_score = await db.get(user_name);
    const score = {
        'name': user_name,
        'wins': user_score.wins + 1,
        'losses': user_score.losses
    };
    db.set(user_name, score);
    return db.get(user_name);
};

/**
 * Adds loss to specific user
 * @param {string} user_name
 * @memberOf Database
 * @returns {Object}
 */
exports.addLoss = async (user_name) => {
    var db = await createInstance();
    // if (!db.has(user_name)) {
    //     createUser(user_name,0,0)
    // }
    let user_score = db.get(user_name);
    const score = {
        'name': user_name,
        'wins': user_score.wins,
        'losses': user_score.losses + 1
    };

    db.set(user_name, score);
    return db.get(user_name);
};

/**
 * Gets all scores in database
 * @memberOf Database
 * @returns {Object} All scores in database
 */
exports.getAllScores = async () => {
    var db = await createInstance();
    let scores = await db.JSON();
    return scores;
}

/**
 * Gets user from database
 * @memberOf Database
 * @returns {Object} returns user
 */
exports.getUser = async (user_name) => {
    var db = await createInstance();
    return db.get(user_name);
}

/**
 * Removes user from database
 * @memberOf Database
 * @returns {Object} Undefined if user does not exist
 */
exports.removeUser = async (user_name) => {
    var db = await createInstance();
    return db.delete(user_name);
}

/**
 * Removes all users from database
 * @memberOf Database
 * @returns {Object}
 */
exports.removeAllUsers = async () => {
    await fs.writeFile(global.filePath, "", {flag: 'w'}, function (err) {
    });
    return true;
}
