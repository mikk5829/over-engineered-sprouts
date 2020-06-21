/** dbTest.js is used for testing the simple database */
var db = require('../server/db/simple-db')
var expect = require('chai').expect;

describe('User', async function() {
    let user_name = "testNormalUser"

    context('Normal user', function() {
        it('should exist', async function() {
            await db.removeUser(user_name)
            await db.createUser(user_name,0,0)
            let user = await db.getUser(user_name)
            expect(user.name).to.equal(user_name)
        })
    })

    context('Normal user', function() {
        it('should not be created twice', async function() {
            let user = await db.createUser(user_name,0,0)
            expect(user).to.equal("user exists")
        })
    })

    context('Normal user', function() {
        it('should have 0 wins', async function() {
            let user = await db.getUser(user_name)
            expect(user.wins).to.equal(0)
        })
    })

    context('Normal user', function() {
        it('should have 0 losses', async function() {
            let user = await db.getUser(user_name)
            expect(user.losses).to.equal(0)
        })
    })

    context('Add win', function() {
        it('should have 1 wins', async function() {
            let user = await db.addWin(user_name)
            expect(user.wins).to.equal(1)
            expect(user.losses).to.equal(0)
        })
    })

    context('Add loss', function() {
        it('should have 1 loss', async function() {
            let user = await db.addLoss(user_name)
            expect(user.losses).to.equal(1)
            expect(user.wins).to.equal(1)
        })
    })

    context('Get users', function() {
        it('should have at least one user', async function() {
            let scores = await db.getAllScores()
            expect(Object.keys(scores).length).to.be.above(1)
        })
    })

    context('Remove test user', function() {
        it('should be undefined', async function() {
            let user = await db.removeUser(user_name)
            expect(user.name).to.be.undefined
            expect(user.wins).to.be.undefined
            expect(user.losses).to.be.undefined
        })
    })

})
