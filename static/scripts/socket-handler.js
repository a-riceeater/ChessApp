_(".loading-text").innerHTML = `<p>Establishing WSS Connection..</p>`
var rating;
var socket;
async function connectToServer() {
  const socketProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${socketProtocol}://${location.hostname}:${1025}`;
  console.log(socketUrl);
  const ws = new WebSocket(socketUrl);

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (ws.readyState === 1) {
        clearInterval(timer)
        ws["on"] = function (name, callback) {
          ons[name] = callback;
        }
        resolve(ws);
      }
    }, 10);
  });
}

(async function () {
  socket = await connectToServer();

  socket.onmessage = (message) => {
    SocketAPI.handleMessage(message.data);
  };

  socket.emit("establish-connection", { username: usernameNoId })

  socket.on("connection-established", () => {
    console.log("CONNECTION ESTABLISHED")
    _(".loading-text").innerHTML = `<p>Connecting to room...</p>`
    postData('/app-api/connect', { user: usernameNoId, room: sessionStorage.getItem("gameId") })
      .then((data) => {
        console.dir(data);
        if (!data.joined) {
          document.body.innerHTML = `
            <div style="position: fixed; transform: translate(-50%, -50%); top: 60%; left: 50%; width: 50%; height: 50%; font-family: var(--m); text-align: center;">
            <img src="../images/pawn-black.png"> 
            <h1>Game not found...</h1>
            <p>You tried to join a game that doesn't exist...</p>
            <p><a href="/" style="color: blue; text-decoration: none;">Return Home</a></p>
            </div>
            `
          return
        } else {
          match = data.match;

          for (let i = 0; i < match.players.length; i++) {
            if (match.players[i] == usernameNoId) continue;
            opponent = match.players[i];
          }

          if (match.white == usernameNoId) { _("#gc-value").iText("White"); color = "white" }
          if (match.black == usernameNoId) { _("#gc-value").iText("Black"); color = "black" }

          _("#opponent-name").iText(opponent);
          _("#win-amt").iText("+" + match.winAmt)
          _("#lose-amt").iText("+" + match.loseAmt)

          var draw;
          if (match.drawAmt.toString().includes("-")) draw = match.drawAmt;
          else draw = "+" + match.drawAmt;

          _("#draw-amt").iText(draw)

          if (color == "white") {
            console.log("AM WHITE")
            _("#user-white-name").iText(usernameNoId)
            _("#user-black-name").iText(opponent)

            postData('/app-api/get-user-ratings', { user: usernameNoId })
              .then((data) => {
                _("#user-white-rating").iText(`(${data.rating})`);
              })

            postData('/app-api/get-user-ratings', { user: opponent })
              .then((data) => {
                _("#user-black-rating").iText(`(${data.rating})`);
              })
          }
          else {
            console.log("AM BLACK")
            _("#user-black-name").iText(usernameNoId)
            _("#user-white-name").iText(opponent)

            postData('/app-api/get-user-ratings', { user: opponent })
              .then((data) => {
                _("#user-white-rating").iText(`(${data.rating})`);
              })

            postData('/app-api/get-user-ratings', { user: usernameNoId })
              .then((data) => {
                _("#user-black-rating").iText(`(${data.rating})`);
              })
          }

          _("#gt-value").iText(match.turn)



          setTimeout(() => _(".loading-text").innerHTML = `<p>Connected to room...</p>`, 300)
        }
      })
      .catch(err => {
        alert(err);
      })
  })


  socket.on("recieve-move", (data) => {
    var deletedPiece;
    console.log(document.getElementById(data.moveTo), document.getElementById(data.moving));
    document.getElementById(data.moveTo).childNodes.forEach((ele) => {
      console.log(ele);
      if (!ele) return;
      if (ele.classList.contains("piece")) {
        console.log("CONTAINS")
        ele.remove();
        const audio = new Audio(`/sounds/take.wav`);
        audio.play();
        deletedPiece = true;
      }
    })
    document.getElementById(data.moveTo).appendChild(document.getElementById(data.moving))
    match = data.match;
    _("#gt-value").iText(match.turn)
    if (!deletedPiece) {
      const playIndex = (Math.random() * (7 - 1) + 1).toFixed();
      console.log("Requesting play playload of /sounds/place" + playIndex + ".wav (playIndex " + playIndex + ")")
      const audio = new Audio(`/sounds/place${playIndex}.wav`);
      audio.play();
    }
  })

  // Game end because of checkmate
  socket.on("game-win", (data) => {
    console.dir(data);
    const winner = data.winner;
    const reason = data.reason;

    if (winner != usernameNoId) _("#winslos").iText("You lost!")

    _(".gameCheckmate").css("scale", 1)
    _("#shade").css("scale", 1)

    /*if (winner == usernameNoId) {
      rating = data.winAmt
    }*/
  })

  // Game end because of draw, stalemate, etc.
  socket.on("game-end", (data) => {
    console.dir(data);
    const drawReason = data.reason;
  })

  socket.on("recieve-msg", (data) => {
    const msg = document.createElement("p")
    msg.classList.add("dft-msg")
    msg.innerHTML = `
      <span class="dft-msg-user">${data.from}</span>
      <span class="dft-msg-content">${data.content}</span>`

    _(".chatMessages").appendChild(msg);
    _(".chatMessages").scrollBottom();
  })
})();