'use strict';
const WebSocket = require('ws')

exports.init = function (app) {
    this.wss = new WebSocket.Server({ server: app });
    setInterval(() => { //check for dead clients
        this.wss.clients.forEach((ws) => {

            if (!ws.isAlive) return ws.terminate();

            ws.isAlive = false;
            ws.ping(null, false, true);
        });
    }, 10000);
    this.wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', () => ws.isAlive = true);
    });
};

exports.broadcast = function (data) {
    this.wss.clients.forEach(client => {
        client.send(data);
    });
};