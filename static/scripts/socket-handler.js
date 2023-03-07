_(".loading-text").innerHTML = `<p>Establishing WSS Connection..</p>`

const socket = io();

async function $src(callback) {
  callback()
}

socket.on("recieve-move", (data) => {  console.dir(document.getElementById(data.moveTo).classList.contains("piece"));

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

// Game end because of checkmate
socket.on("game-win", (data) => {
  console.dir(data);
  const winner = data.winner;
  const reason = data.reason;
})

// Game end because of draw, stalemate, etc.
socket.on("game-end", (data) => {
  console.dir(data);
  const drawReason = data.reason;
})