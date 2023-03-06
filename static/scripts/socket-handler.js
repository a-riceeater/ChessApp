_(".loading-text").innerHTML = `<p>Establishing WSS Connection..</p>`

const socket = io();

socket.emit("establish-connection", { username: usernameNoId });

socket.on("recieve-move", (data) => {
    console.dir(document.getElementById(data.moveTo).classList.contains("piece"));

    document.getElementById(data.moveTo).childNodes.forEach((ele) => {
        console.log(ele);
        if (!ele) return;
        if (ele.classList.contains("piece")) {
            console.log("CONTAINS")
            ele.remove();
        }
    })

    document.getElementById(data.moveTo).appendChild(document.getElementById(data.moving))
    match = data.match;
    _("#gt-value").iText(match.turn)
})