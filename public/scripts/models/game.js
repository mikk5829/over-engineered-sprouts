/*
// Server file

class Game {
    constructor(id, creator) {
        this.id = id;
        this.playerCount = 0;
        this.playerHost = null; // First player
        this.playerClient = null; // Second player
        this.paths = [];
        this.dots = [];
        // this.observers = [];
    }

    joinGame(client) {
        console.log(`${client.username} wants to join game ${this.id}`)
        if (!this.playerHost) this.playerHost = client;
        else if (!this.playerClient) this.playerClient = client;
        this.playerCount++;
        client.join(this.id);
    }

    leaveGame(client) {
        if (client === this.playerHost) {
            this.playerHost = this.playerClient ? this.playerClient : null;
            this.playerClient = this.playerClient === this.playerHost ? null : this.playerClient;
        } else if (client === this.playerClient) this.playerClient = null;
        client.leave(this.id);
    }
}*/
