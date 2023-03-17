const username = localStorage.getItem("username")
var usernameNoId;
if (username) usernameNoId = localStorage.getItem("username").replace("." + username.split(".")[1], "")
// const socket = io();
const socket = io();

async function connectToServer() {
  const socketProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${socketProtocol}://${location.hostname}:${1025}`;
  const ws = new WebSocket(socketUrl);

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      document.body.innerHTML = ws.readyState;
      if (ws.readyState === 1) {
        clearInterval(timer)
        ws["on"] = function (name, callback) {
          ons.set(name, callback);
        }
        resolve(ws);
      }
    }, 10);
  });
}

/*(async function() {
  try {
    socket = await connectToServer();
   // alert("Connected to websocket.")

    _("#pc-username").innerHTML = `Welcome, ${usernameNoId}.`

    socket.emit("establish-connection", { username: usernameNoId })

    socket.onmessage = (message) => {
      SocketAPI.handleMessage(message);
    };

    socket.on("update-queue", (data) => {
      console.log(data);
    })
  } catch (err) {
    alert(err);
  }

})();*/

_("#pc-username").innerHTML = usernameNoId + " "
socket.emit("establish-connection", { username: usernameNoId })

socket.on("update_queue", (data) => {
  console.dir(data);
  _("#queue-amt").iText(data.amount + " users in queue")
})

socket.on("connection-established", () => {

  if (document.URL.includes("?")) {
    if (document.URL.split("?")[1] == "q=1") {
      setTimeout(() => _("#join-queue-btn").click(), 500);
    }
  }

  if (sessionStorage.getItem("q") == 1) {
    sessionStorage.removeItem("q")
    setTimeout(() => _("#join-queue-btn").click(), 500);
  }
})

socket.on("join_game", (data) => {
  const gameId = data.gameId;
  sessionStorage.setItem("gameId", gameId)
  window.location = '/play/' + gameId;
})

fetch('/app-api/get-queue-members', { headers: { 'Content-Type': 'application/json' } })
  .then((data) => { return data.json(); })
  .then((data) => _("#queue-amt").iText(data.amount + " users in queue"))

fetch('/app-api/get-rating', { headers: { 'Content-Type': 'application/json' } })
  .then((data) => { return data.json(); })
  .then((data) => _("#pc-username").innerText += " (" + data.rating + ")")

fetch('/app-api/get-site-analysis', { headers: { 'Content-Type': 'application/json' } })
  .then((data) => { return data.json(); })
  .then((data) => {
    _("#totalOnline").iText(`${data.online} users currently online - ${data.siteVisits} total site visits.`)
  })

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

window.addEventListener("error", (e) => {
  alert(e.message)
})

setTimeout(() => {
  document.getElementById("loading-screen").css("opacity", 0);
  setTimeout(() => document.getElementById("loading-screen").hide(), 1000);
}, 1500)