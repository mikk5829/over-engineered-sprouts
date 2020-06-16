/*
// argh

const GameFactory = require('/public/scripts/models/game.js');
const gameServer = {games: {}};
gameServer.createGame = (io, name) => {
    const Game = GameFactory(io);
    const newGame = new Game(creator);
    console.log("New game object created", newGame);
    gameServer.games[newGame.id] = newGame;
    return newGame;
};

gameServer.findGame = gameId => gameServer.games[gameId];
module.exports = gameServer;*/
