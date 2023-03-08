const username = localStorage.getItem("username")
var usernameNoId;
if (username) usernameNoId = localStorage.getItem("username").replace("." + username.split(".")[1], "")
const socket = io();

socket.on("update_queue", (data) => {
  console.dir(data);
  _("#queue-amt").iText(data.amount + " users in queue")
})

socket.on("join_game", (data) => {
  const gameId = data.gameId;
  sessionStorage.setItem("gameId", gameId)
  window.location = '/play/' + gameId;
})

fetch('/app-api/get-queue-members', { headers: { 'Content-Type': 'application/json' } })
  .then((data) => { return data.json() })
  .then((data) => {
    _("#queue-amt").iText(data.amount + " users in queue")
  })

if (!username) {
  _("#pc-username").innerHTML = `<input type="text" id="username-input" placeholder="Your username for this session">`
  _("#join-queue-btn").iText("Confirm")

  setTimeout(() => {
    _("#username-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = _("#username-input").value;
        if (value.replaceAll(" ", "") == "") return;
        const id = (performance.now().toString(26) + Math.random().toString(26)).replace(/\./g, '');
        localStorage.setItem("username", value + "." + id)
        window.location = ''
      }
    })
  }, 150)
}

else {
  _("#pc-username").innerHTML = `Welcome, ${usernameNoId}.`
  _("#uuid").iText(username.split(".")[1])

  socket.emit("establish-connection", { username: usernameNoId });
}

_("#reset").addEventListener("click", (e) => {
  const p = confirm("This will reset your data. Are you sure?")
  if (!p) return;
  localStorage.removeItem("username");
  window.location = '';
})

var inQueue;
_("#join-queue-btn").addEventListener("click", (e) => {
  const btn = _("#join-queue-btn");
  if (btn.innerText.includes("Cancel")) {
    postData('/app-api/leave-queue')
      .then((data) => {
        btn.innerText = "Join Queue"
        inQueue = false;
      })
    return;
  }
  if (btn.innerText == "Confirm") {
    e.preventDefault();
    const value = _("#username-input").value;
    if (value.replaceAll(" ", "") == "") return;
    const id = (performance.now().toString(26) + Math.random().toString(26)).replace(/\./g, '');
    localStorage.setItem("username", value + "." + id)
    window.location = ''
  } else if (btn.innerText == "Join Queue") {
    btn.innerText = "Loading..."
    postData('/app-api/join-queue', { user: usernameNoId })
      .then((data) => {

        console.dir(data)

        var min = 0;
        var sec = 0;
        inQueue = true;

        setTimeout(() => { if (!inQueue) return; btn.iText("Cancel (0:0)"), getRand(200, 500) })

        function inc() {
          sec++;
          if (sec == 60) {
            sec = 0;
            min++;
          }
          if (!inQueue) return;
          btn.iText(`Cancel (${min}:${sec})`)
          setTimeout(inc, 1000)
        }

        setTimeout(inc, 1000)
      })
  } else {

  }
})

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
    .catch((err) => {
      document.body.innerHTML = `
        <div style="position: fixed; transform: translate(-50%, -50%); top: 60%; left: 50%; width: 50%; height: 50%; font-family: var(--m); text-align: center;">
        <img src="images/pawn-black.png"> 
        <h1>Whoops!</h1>
        <p>An error occured.</p>
        <p>Details: ${err}</p>
        <p><a href="/" style="color: blue; text-decoration: none;">Reload</a></p>
        </div>
        `
      document.body.style.background = "white";
    })
  return response.json();
}

if (document.URL.includes("?")) {
  if (document.URL.split("?")[1] == "q=1") {
    setTimeout(() => _("#join-queue-btn").click(), 500);
  }
}

if (sessionStorage.getItem("q") == 1) {
  sessionStorage.removeItem("q")
  setTimeout(() => _("#join-queue-btn").click(), 500);
}

setTimeout(() => {
  document.getElementById("loading-screen").css("opacity", 0);
  setTimeout(() => document.getElementById("loading-screen").hide(), 1000);
}, 1500)