const ons = new Map();

WebSocket.prototype.emit = function (name, data) {
    this.send(JSON.stringify([{ name: name }, data]));
}

WebSocket.prototype.on = function (name, callback) {
    ons.set(name, callback);
}


const SocketAPI = {
    handleMessage: function (d) {
        d = JSON.parse(d);
        const name = d[0].name;
        const data = d[1];

        [...ons.keys()].forEach((on) => {
            console.log(on);
            if (on == name) {
                
            }
        });
    }
}