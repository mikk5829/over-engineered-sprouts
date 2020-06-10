const JSONdb = require('simple-json-db');
var fs = require('fs');
/**
 * These functions are used to manipulate the simple database
 * @namespace Database
 * @author Mikkel Anderson
 * */

/**
 * Generates a file path and name based on current UNIX timestamp.
 * @returns {string}
 */
// function genFileName() {
//     return '/tmp/database.json';
// }
//
// /**
//  * Makes sure that a unique filename is generated.
//  */
// (function genFilePath() {
//     while (true) {
//         try {
//             global.filePath = genFileName();
//             fs.statSync(global.filePath);
//         } catch (err) {
//             break;
//         }
//     }
// })();

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
 */
exports.createUser = (user_name, user_wins, user_losses) => {
    var db = createInstance();
    const score = {
        'wins': user_wins,
        'losses': user_losses
    }

    db.set(user_name, score);
    return db.get(user_name);
}
