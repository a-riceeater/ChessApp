var selectedPiece, opponent, pmSelect, pmTo;
const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];


/*for (let i = 0; i < chessboardRows.length; i++) {
  const squares = chessboardRows[i].querySelectorAll('.square');
  for (let j = 0; j < squares.length; j++) {
    const column = columns[j];
    const row = 8 - i;
    const id = column + row;

    // Set the id of the square to its location on the chessboard
    squares[j].setAttribute('id', id);
  }
}
*/
const username = localStorage.getItem("username")
var usernameNoId;
if (username) usernameNoId = username;

fetch('/app-api/get-site-analysis', { headers: { 'Content-Type': 'application/json' } })
  .then((data) => { return data.json(); })
  .then((data) => {
    _("#totalOnline").iText(`${data.online} users currently online - ${data.siteVisits} total site visits.`)
  })

try {
  $src(() => {
    socket.on("connection-established", () => {
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
            var isBlackOnBottom = false;

            if (match.white == usernameNoId) color = "white"
            else color = "black"

            if (color == "black") {
              _("#chessboard-white").remove();

              isBlackOnBottom = true;
            } else {
              _("#chessboard-black").remove();
            }

            /*
            for (let i = 0; i < chessboardRows.length; i++) {
  const squares = chessboardRows[i].querySelectorAll('.square');
  for (let j = 0; j < squares.length; j++) {
    const column = columns[j];
    const row = 8 - i;
    const id = column + row;

    // Set the id of the square to its location on the chessboard
    squares[j].setAttribute('id', id);
  }
}*/
            const chessboardRows = document.querySelectorAll(isBlackOnBottom ? "#chessboard-black > .row" : "#chessboard-white > .row")

            for (let i = 0; i < chessboardRows.length; i++) {
              const squares = chessboardRows[i].querySelectorAll('.square');
              const row = isBlackOnBottom ? i + 1 : 8 - i;

              // Loop through each square in the row
              for (let j = 0; j < squares.length; j++) {
                const column = columns[j];
                const id = column + row;

                // Set the id of the square to its location on the chessboard
                squares[j].setAttribute('id', id);
              }
            }
            for (let i = 0; i < match.players.length; i++) {
              if (match.players[i] == usernameNoId) continue;
              opponent = match.players[i];
            }
            incrimentTime();
          }



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
                _("#user-white-rating").setAttribute("data", usernameNoId)
              })

            postData('/app-api/get-user-ratings', { user: opponent })
              .then((data) => {
                _("#user-black-rating").iText(`(${data.rating})`);
                _("#user-black-rating").setAttribute("data", opponent)
              })
          }
          else {
            console.log("AM BLACK")
            _("#user-white-name").iText(usernameNoId)
            _("#user-black-name").iText(opponent)

            postData('/app-api/get-user-ratings', { user: opponent })
              .then((data) => {
                _("#user-black-rating").iText(`(${data.rating})`);
                _("#user-black-rating").setAttribute("data", opponent)
              })

            postData('/app-api/get-user-ratings', { user: usernameNoId })
              .then((data) => {
                _("#user-white-rating").iText(`(${data.rating})`);
                _("#user-white-rating").setAttribute("data", usernameNoId)
              })
          }

          _("#gt-value").iText(match.turn)
          $rm();



          setTimeout(() => _(".loading-text").innerHTML = `<p>Connected to room...</p>`, 300)

        })
        .catch(err => {
          alert(err);
        })
    })

    setTimeout(() => {
      socket.emit("establish-connection", { username: usernameNoId })
    }, 500)
  })
} catch (Eerr) {
  alert(Eerr)
}

setTimeout(() => _(".loading-text").innerHTML = `<p>Establishing Functions...</p>`, 1000)
document.querySelectorAll(".piece").forEach(ele => {

  ele.addEventListener("click", (e) => {
    if (match.turn == usernameNoId) {
      if (!selectedPiece && !ele.getAttribute("src").includes(color)) return;

      if (selectedPiece && !ele.getAttribute("src").includes("color")) {
        if (selectedPiece.classList.contains("square")) return;
        postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: ele.parentNode.id, moving: selectedPiece.getAttribute("id"), c: color, to: ele.parentNode.id, from: selectedPiece.parentNode.id, to: ele.parentNode.id })
          .then((data) => {
            selectedPiece.classList.remove("selected")
            selectedPiece = null;
            if (data.notAllUsersConnected) {
              alert("Not all users have connected yet. Please try again.")
            }
          })
        return;
      }

      _(".piece", true).forEach(ele2 => {
        if (ele != ele2) ele2.classList.remove("selected")
      })

      selectedPiece = ele;
      ele.classList.toggle("selected");

      if (ele == selectedPiece) return;

      console.log(selectedPiece.getAttribute("src"), ele.getAttribute("src"))

      // Checks if clicking on own piece
      if (selectedPiece.getAttribute("src").includes("black") && ele.getAttribute("src").includes("black")) { _(".piece", true).forEach(ele2 => ele2.classList.remove("selected")); selectedPiece = null; return; }
      if (selectedPiece.getAttribute("src").includes("white") && ele.getAttribute("src").includes("white")) { _(".piece", true).forEach(ele2 => ele2.classList.remove("selected")); selectedPiece = null; return; }

      console.log(color)
      if (selectedPiece.classList.contains("square")) return;
      postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: ele.id, moving: selectedPiece.getAttribute("id"), c: color, to: ele.id, from: selectedPiece.parentNode.id, to: ele.parentNode.id })
        .then((data) => {
          selectedPiece.classList.remove("selected")
          selectedPiece = null;
        })
    }
    else {
    }
  })
})

document.querySelectorAll(".square").forEach(ele => {
  ele.addEventListener("click", (e) => {
    if (!selectedPiece) return;
    if (match.turn == usernameNoId) {
      if (selectedPiece == ele) return;
      if (e.target.classList.contains("piece")) return;


      ele.childNodes.forEach(ele3 => {
        if (!ele3) return;
        if (ele3.classList.contains("piece")) {

          // Checks if clicking on own piece
          if (selectedPiece.getAttribute("src").includes("black") && ele3.getAttribute("src").includes("black")) { _(".piece", true).forEach(ele2 => ele2.classList.remove("selected")); selectedPiece = null; return; }
          if (selectedPiece.getAttribute("src").includes("white") && ele3.getAttribute("src").includes("white")) { _(".piece", true).forEach(ele2 => ele2.classList.remove("selected")); selectedPiece = null; return; }
        }
      })

      console.log(color, selectedPiece.parentNode.id, ele.id)

      if (selectedPiece.classList.contains("square")) return;
      postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: ele.id, moving: selectedPiece.getAttribute("id"), c: color, to: ele.id, from: selectedPiece.parentNode.id, to: ele.id })
        .then((data) => {
          console.dir(data);
          if (data.notAllUsersConnected) {
            alert("Not all users have connected yet. Please try again.")
          }
          if (!data.moved) return;
          selectedPiece.classList.remove("selected")
          selectedPiece = null;
        })
      e.stopPropagation();
    }
    else {
      console.log(selectedPiece)

    }
  })
})

function hideModals() {
  _(".modal", true).forEach(ele => ele.css("scale", 0))
  _("#shade").css("scale", 0)
}

_("#shade").addEventListener("click", hideModals);
_(".closeModalBtn", true).forEach(ele => ele.addEventListener("click", hideModals))

window.addEventListener('beforeunload', (e) => {
  return "Are you want to leave?";
})

_(".newgame-btn").addEventListener("click", () => {
  sessionStorage.setItem("q", 1);
  window.location = '/?q=1'
})

_("#chatbox").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    if (_("#chatbox").value.replaceAll(" ", "") == "") return;

    postData('/app-api/sendMsg', { content: _("#chatbox").value })
    _("#chatbox").value = ''
  }
})

var minYou = 9;
var secYou = 59;

var minThem = 9;
var secThem = 59;

function incrimentTime() {
  if (gameEnded) return;
  setTimeout(() => {
    if (gameEnded) return;
    if (match.turn == usernameNoId) {
      if (secYou == 0) {
        minYou--;
        secYou = 59;
      }
      else {
        secYou--;
      }

      _("#user-white-time").iText(`${minYou}:${secYou.toString().length == 1 ? "0" + secYou : secYou}`)

      if (minYou == 0 && secYou == 0) {
        postData('/app-api/game-lose', { time: `${minYou}:${secYou.toString().length == 1 ? "0" + secYou : secYou}` })
          .then((data) => {
            console.dir(data);
          })
        return;
      }

    }
    else {
      if (secThem == 0) {
        minThem--;
        secThem = 59;
      }
      else {
        secThem--;
      }

      _("#user-black-time").iText(`${minThem}:${secThem.toString().length == 1 ? "0" + secThem : secThem}`)
    }

    if (match.turn == usernameNoId) {
      _("#user-white-time").classList.add("timing")
      _("#user-black-time").classList.remove("timing")
    }
    else {
      _("#user-white-time").classList.remove("timing")
      _("#user-black-time").classList.add("timing");
    }
    incrimentTime();
  }, 1000)
}

_("#resign-btn").addEventListener("click", () => {
  if (confirm("Resign?")) {
    postData('/app-api/resign-game')
      .then((data) => {
        console.dir(data);
      })
  }
})

var mouseDown = false;
var movePiece;
_(".piece", true).forEach((piece) => {
  piece.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (!piece.src.includes(color)) return;
    piece.classList.add("moving");
    movePiece = piece;
    mouseDown = true;
  })
})

document.addEventListener("mouseup", (e) => {
  if (!mouseDown) return;
  e.preventDefault();
  movePiece.classList.remove("moving");
  mouseDown = false;

  var square = document.elementFromPoint(event.clientX, event.clientY);

  if (square.classList.contains("piece")) square = square.parentNode;

  if (!square.classList.contains("square")) return

  if (match.turn == usernameNoId) {
    postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: square.id, moving: movePiece.getAttribute("data"), c: color, to: square.id, from: movePiece.parentNode.id, to: square.id })
      .then((data) => {
        selectedPiece.classList.remove("selected")
        selectedPiece = null;
        if (data.notAllUsersConnected) {
          alert("Not all users have connected yet. Please try again.")
        }
      })
  } else {
    if (gameEnded) return;
    pmSelect = movePiece;
    pmTo = square;

    if (pmSelect.classList.contains("movedTo")) pmSelect.classList.remove("movedTo")
    if (pmTo.classList.contains("movedTo")) pmTo.classList.remove("movedTo")

    if (pmSelect.classList.contains("movedFrom")) pmSelect.classList.remove("movedFrom")
    if (pmTo.classList.contains("movedFrom")) pmTo.classList.remove("movedFrom")


    console.log("PM: " + pmSelect + " " + pmTo)
    console.log(movePiece, square)

    _(".red", true).forEach(ele => ele.classList.remove("red"));
    pmSelect.parentNode.classList.add("red")
    pmTo.classList.add("red")
  }

  console.log(square);
  movePiece = null;
})


document.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;

  // Subtraction to set cursor to middle of element, rather than top left.
  let left = e.pageX - 32;
  let top = e.pageY - 25;

  movePiece.style.left = left + "px";
  movePiece.style.top = top + "px"
})

function executePremove() {
  console.log("EXECUTING PREMOVE", pmSelect, pmTo)

  if (match.turn != usernameNoId) return;
  if (!pmSelect || !pmTo) return;

  postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: pmTo.id, moving: pmSelect.getAttribute("data"), c: color, to: pmTo.id, from: pmSelect.parentNode.id, to: pmTo.id })
    .then((data) => {
      try {

        pmSelect.parentNode.classList.remove("red")
        pmTo.classList.remove("red")

        _(".red", true).forEach(ele => ele.classList.remove("red"))

        selectedPiece.classList.remove("selected")
        selectedPiece = null;
        if (data.notAllUsersConnected) {
          alert("Not all users have connected yet. Please try again.")
        }
      } catch (err) { };
    })
}

setTimeout(() => {
  _("#loading-screen").css("opacity", 0);
  setTimeout(() => _("#loading-screen").hide(), 1000);
}, getRand(1000, 5000))

async function postData(url = '', body = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  return response.json();
}