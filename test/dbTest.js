/** dbTest.js is used for testing the simple database */
var db = require('../server/db/simple-db')
var expect = require('chai').expect;

describe('database testing', async function() {
    let user_name = "testNormalUser"
    let new_user_name = "testNormalUser2"

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
            expect(Object.keys(scores).length).to.be.at.least(1)
        })
    })

    context('Change name', function() {
        it('should change name in db and have same score', async function() {
            let user = await db.getUser(user_name)
            await db.changeUsername(user_name,new_user_name)
            let new_user = await db.getUser(new_user_name)
            expect(user.losses).to.equal(new_user.losses)
            expect(user.wins).to.equal(new_user.wins)
            expect(user.name).to.not.equal(new_user.name)
        })
    })

    context('Remove test user', function() {
        it('should be undefined', async function() {
            let user = await db.removeUser(new_user_name)
            expect(user.name).to.be.undefined
            expect(user.wins).to.be.undefined
            expect(user.losses).to.be.undefined
        })
    })

})
