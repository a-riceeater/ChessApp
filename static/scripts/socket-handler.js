_(".loading-text").innerHTML = `<p>Establishing WSS Connection..</p>`

const socket = io();

async function $src(callback) {
  callback()
}

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