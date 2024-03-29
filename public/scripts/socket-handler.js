var currentMove, match, color, gameEnded;

_(".loading-text").innerHTML = `<p>Establishing WSS Connection..</p>`
var rating;
var socket = io();

/*async function connectToServer() {
  const ws = new WebSocket('ws://' + window.location.origin.replace("http://", "") + ":1025");
  socket = ws;
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (ws.readyState === 1) {
        clearInterval(timer)
        resolve(ws);
      }
    }, 10);
  });
}*/


async function $src(callback) {
  callback()
}

function $rm() {
socket.on("recieve-move", (data) => {
  var deletedPiece;

  _(".movedFrom", true).forEach(ele => ele.classList.remove("movedFrom"));
  _(".movedTo", true).forEach(ele => ele.classList.remove("movedTo"));

  console.log(document.getElementById(data.moveTo), document.querySelector(`[data=${data.moving}]`));

  document.getElementById(data.moveTo).classList.add("movedFrom")
  document.querySelector(`[data=${data.moving}]`).parentNode.classList.add("movedTo")
  
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
  document.getElementById(data.moveTo).appendChild(document.querySelector(`[data=${data.moving}]`))
  match = data.match;
  _("#gt-value").iText(match.turn)
  if (!deletedPiece) {
    const playIndex = (Math.random() * (7 - 1) + 1).toFixed();
    console.log("Requesting play playload of /sounds/place" + playIndex + ".wav (playIndex " + playIndex + ")")
    const audio = new Audio(`/sounds/place${playIndex}.wav`);
    audio.play();
  }

  if (data.inCheck) {
    _(".red", true).forEach(ele => ele.classList.remove("red"));
    // K = WHITE
    // k == BLACK
    if (data.whoMoved == usernameNoId) {
      // If you put them into check
      if (color == "white") { 
        document.querySelector("[data=k]").parentNode.classList.add("red")
        setTimeout(() => {
          if (!data.isCM) document.querySelector("[data=k]").parentNode.classList.remove("red")
        }, 2500)
      }
      else {
        document.querySelector("[data=K]").parentNode.classList.add("red")
        setTimeout(() => {
          if (!data.isCM) document.querySelector("[data=K]").parentNode.classList.remove("red")
        }, 2500) 
      }
    } 
    else {
      // If they put you into check
      if (color == "white") { 
        document.querySelector("[data=K]").parentNode.classList.add("red")
        setTimeout(() => {
          if (!data.isCM) document.querySelector("[data=K]").parentNode.classList.remove("red")
        }, 2500) }
      else { 
        document.querySelector("[data=k]").parentNode.classList.add("red")
        setTimeout(() => {
          if (!data.isCM) document.querySelector("[data=k]").parentNode.classList.remove("red")
        }, 2500) 
      }
    }
  }
  executePremove();
})
}

// Game end because of checkmate
socket.on("game-win", (data) => {
  console.dir(data);
  const winner = data.winner;
  const reason = data.reason;

  if (winner != usernameNoId) _("#winslos").iText("You lost!")

  _(".gameCheckmate").css("scale", 1)
  _("#shade").css("scale", 1)
  gameEnded = true;
  _("#newGameLink").show();

  /*if (winner == usernameNoId) {
    rating = data.winAmt
  }*/
})

// Game end because of draw, stalemate, etc.
socket.on("game-end", (data) => {
  console.dir(data);
  gameEnded = true;
  _("#newGameLink").show();
  const drawReason = data.reason;
  _(".gameDraw").css("scale", 1);
  _("#shade").css("scale", 1);
  _("#draw-reason").iText(drawReason);
})

socket.on("game-loss-time", (data) => {
  console.dir(data);
  const loser = data.loser;
  gameEnded = true;
  _("#newGameLink").show();

  if (loser == usernameNoId) _("#winslos").iText("You lost!")
  _("#win-reason").iText("By timeout")

  if (loser != usernameNoId) {
    if (color == "black") _("#user-white-time").iText(data.time);
    else _("#user-black-time").iText(data.time)
  } else {
    if (color == "black") _("#user-black-time").iText(data.time);
    else _("#user-white-time").iText(data.time)
  }

  _(".gameCheckmate").css("scale", 1)
  _("#shade").css("scale", 1)

})

socket.on("game-resign", (data) => {
  console.dir(data);
  gameEnded = true;
  _("#newGameLink").show();
  const resign = data.user;

  if (resign == usernameNoId) _("#winslos").iText("You lost!")
  _("#win-reason").iText("By resign")

  _(".gameCheckmate").css("scale", 1)
  _("#shade").css("scale", 1)
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