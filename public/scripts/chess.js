var selectedPiece, match, opponent, color;

const chessboardRows = document.querySelectorAll('.row');

// Array of characters representing the columns on the chessboard
const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Loop through each row
for (let i = 0; i < chessboardRows.length; i++) {
  const squares = chessboardRows[i].querySelectorAll('.square');

  // Loop through each square in the row
  for (let j = 0; j < squares.length; j++) {
    const column = columns[j];
    const row = 8 - i;
    const id = column + row;

    // Set the id of the square to its location on the chessboard
    squares[j].setAttribute('id', id);
  }
}

const username = localStorage.getItem("username")
var usernameNoId;
if (username) usernameNoId = username;

_("#uuid").iText(username.split(".")[1])
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


    if (!selectedPiece && !ele.getAttribute("src").includes(color)) return;
    if (selectedPiece && !ele.getAttribute("src").includes("color")) {
      postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: ele.parentNode.id, moving: selectedPiece.id, c: color, to: ele.parentNode.id, from: selectedPiece.parentNode.id, to: ele.parentNode.id })
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

    if (match.turn != usernameNoId) return;
    if (ele == selectedPiece) return;

    console.log(selectedPiece.getAttribute("src"), ele.getAttribute("src"))

    // Checks if clicking on own piece
    if (selectedPiece.getAttribute("src").includes("black") && ele.getAttribute("src").includes("black")) { _(".piece", true).forEach(ele2 => ele2.classList.remove("selected")); selectedPiece = null; return; }
    if (selectedPiece.getAttribute("src").includes("white") && ele.getAttribute("src").includes("white")) { _(".piece", true).forEach(ele2 => ele2.classList.remove("selected")); selectedPiece = null; return; }

    console.log(color)

    postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: ele.id, moving: selectedPiece.id, c: color, to: ele.id, from: selectedPiece.parentNode.id, to: ele.parentNode.id })
      .then((data) => {
        selectedPiece.classList.remove("selected")
        selectedPiece = null;
      })
  })
})

document.querySelectorAll(".square").forEach(ele => {
  ele.addEventListener("click", (e) => {
    if (!selectedPiece) return;
    if (match.turn != usernameNoId) return;
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
    postData('/app-api/move', { user: usernameNoId, room: sessionStorage.getItem("gameId"), moveTo: ele.id, moving: selectedPiece.id, c: color, to: ele.id, from: selectedPiece.parentNode.id, to: ele.id })
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