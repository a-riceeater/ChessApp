// import WebSocket from 'ws';
// const wss = new WebSocket.Server({ port: process.env.wssPort });
import tokens from './server/tokens.js'
import ms from './ms.js'

const clients = new Map();

function getClients() {
    return clients;
}

function on(socket, d) {
    const id = clients.get(socket);
    const name = d[0]
    const data = d[1];
    console.log(data, id);

    switch (name) {
        case "establish-connection": {
            console.log("Established WSS connection " + socket.id + " " + data.username)
            ms.putSockets(data, id);
            // socket.emit("connection-established", {})
        }
    }
}

function setClient(ws, id) {
    clients.set(ws, id)
}

export default { setClient, on }
