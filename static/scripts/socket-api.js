WebSocket.prototype.emit = function (name, data) {
    this.send(JSON.stringify([{ name: name }, data]));
}