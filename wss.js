import WebSocket from 'ws';
const wss = new WebSocket.Server({ port: process.env.wssPort });
import tokens from './server/tokens.js'

const clients = new Map();


function init() {
    console.log("WSS Innitiated")
    wss.on("connection", (ws) => {
        const id = tokens.createRandomId(26);
        clients.set(ws, metadata);
        console.log("Client with ID of " + id + " is connecting.")

        ws.onerror = function () {
            console.log('websocket error')
        }
    })
}

function getClients() {
    return clients;
}

export default { init }
