const ons = [];

WebSocket.prototype.emit = function (name, data) {
    this.send(JSON.stringify([{ name: name }, data]));
}

WebSocket.prototype.on = function (name, callback) {
    ons[name] = callback;
}


const SocketAPI = {
    handleMessage: function (d) {
        d = JSON.parse(d);
        const name = d[0].name;
        const data = JSON.stringify(d[1]);

        ons[name](data);
    }
}