const ons = [];

WebSocket.prototype.emit = function (name, data) {
    console.log(JSON.stringify([{ name: name }, data]))
    this.send(JSON.stringify([{ name: name }, data]));
}

WebSocket.prototype.on = function (name, callback) {
    ons[name] = callback;
}


const SocketAPI = {
    handleMessage: function (d) {
        d = JSON.parse(d);
        const name = d[0].name;
        const data = d[1]

        if (ons[name]) ons[name](data);
    }
}