// import WebSocket from 'ws';
// const wss = new WebSocket.Server({ port: process.env.wssPort });
import tokens from './server/tokens.js'
import ms from './ms.js'

const clients = new Map();
const rooms = new Map();

function getClients() {
    return clients;
}

function on(socket, d) {
    const id = clients.get(socket);
    const name = d[0].name;
    const data = d[1];

    switch (name) {
        case "establish-connection": {
            console.log("Established WSS connection " + socket.id + " " + data.username)
            ms.putSockets(data, id);
            socket.emit("connection-established", {})
            
        }
    }
}

function setClient(ws, id) {
    clients.set(ws, id)
    clients.set(id, ws);
}

function deleteClient(ws) {
    clients.delete(ws);
}

function joinRoom(ws, name) {
    rooms.set(ws, name)
}  

export default { setClient, on, deleteClient, joinRoom }
