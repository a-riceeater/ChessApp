WebSocket.prototype.emit = function (name, data) {
    this.send(JSON.stringify([{ name: name }, data]));
}

WebSocket.prototype.on = function (d) {
    const name = d[0].name;
    const data = d[1];

    switch (name) {
        
    }
}