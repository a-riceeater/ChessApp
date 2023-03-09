import dotenv from "dotenv"
import { createRequire } from "module";
dotenv.config();
import express from 'express'
const app = express()
import http from "http"
import path from "path"
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
import morgan from "morgan"
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server, { 'force new connection': true });
// const favicon = require('serve-favicon');
import rateLimit from 'express-rate-limit'
//const helmet = require("helmet"); Use this if you want sequirty response headers (may cause bugs with code)
const port = process.env.port; // Change this to proccess.env.portAbove if experiencing errors
// const prompt = require('prompt-sync')({ sigint: true });
import fs from "fs"
import sqlite3 from "sqlite3"
sqlite3.verbose();
import cors from "cors"
const corsOptions = {
  origin: '*',
  credentials: true
};
import { Chess } from 'chess.js'
import tokenManager from './server/tokens.js'

function arrayLength(array) {
  var a = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] != null) a++;
  }
  return a;
}

const apiLimiter = rateLimit({
  windowMs: 20000,
  max: 75,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    limiter: true,
    message: 'Too many requests!',
    type: 'error'
  }
})

function authenticateToken(req, res, next) {
  if (!req.headers.cookie) return res.redirect("/register")
  if (!req.headers.cookie.includes("token=")) return res.redirect("/register")
  const token = req.headers.cookie.split("token=")[1];
  if (!token) return res.redirect("/register")
  else {
    tokenManager.verifyToken(token, res, (verified) => {
      if (verified) next()
      else {
        res.clearCookie("token")
        res.redirect("/register")
      }
    })
  }
}

function authAlready(req, res, next) {
  if (!req.headers.cookie) return next()
  if (!req.headers.cookie.includes("token=")) return next();
  const token = req.headers.cookie.split("token=")[1];
  if (!token) return next();
  else {
    tokenManager.verifyToken(token, res, (verified) => {
      if (verified) {
        res.redirect("/")
      }
      else return next();
    })
  }
}

app.use('/app-api/', apiLimiter)

const matches = new Map();

class Match {
  constructor(id, players, black, white, winAmt, drawAmt, loseAmt) {
    this.id = id;
    this.players = players;
    this.board = new Chess();
    this.black = black;
    this.white = white;
    this.turn = white
    this.winAmt = winAmt;
    this.drawAmt = drawAmt;
    this.loseAmt = loseAmt;
  }
}

var queueUsers = [];
const sockets = [];
const rooms = [];
const playing = [];

app.use(cors(corsOptions));
app.use(express.static("static"))
app.set('socketio', io);
// app.use(morgan(':method :url :status :res[content-length] :response-time ms')) Use this if you want to see post and get logging information
app.use(express.json())
// app.use(helmet()) Use this if you want sequirty response headers (may cause bugs with code)

function rp(p) {
  return path.join(__dirname, p);
}

app.get("/", authenticateToken, (req, res) => {
  res.sendFile(rp("html/queue.html"))
})

app.get("/register", authAlready, (req, res) => {
  res.sendFile(rp("html/register.html"))
})

app.get("/login", authAlready, (req, res) => {
  res.sendFile(rp("html/login.html"))
})

app.get("/play", authenticateToken, (req, res) => {
  res.sendFile(rp("html/game.html"))
})

app.post("/app-api/join-queue", authenticateToken, (req, res) => {
  const user = req.body.user;
  if (user.replaceAll(" ", "") == "") return;

  queueUsers.push(user);
  const socket = io.sockets.sockets.get(sockets[user]);
  socket.join("queue");
  // rooms[user] = "queue";
  res.send({ joined: true })


  if (arrayLength(queueUsers) > 2) {
    queueUsers = [];
    return;
  }

  if (arrayLength(queueUsers) == 2) {
    const id = tokenManager.createRandomId(26)
    io.to("queue").emit("join_game", { gameId: id });
    ratings.calculateWinDrawLose("a", "hola", (data) => {
      console.dir(data);
      const match = new Match(id, queueUsers, queueUsers[0], queueUsers[1], data.win, data.draw, data.lose);
      matches.set(queueUsers, match)
      matches.set(id, match);
      queueUsers = [];
    })
  }


  io.emit("update_queue", { amount: arrayLength(queueUsers) });
})

app.get("/app-api/get-queue-members", (req, res) => {
  res.send({ amount: queueUsers.length });
})

app.get("/play/:id", authenticateToken, (req, res) => {
  res.sendFile(rp("html/game.html"))
})

app.post("/app-api/connect", (req, res) => {
  try {
    const user = req.body.user;
    const socket = io.sockets.sockets.get(sockets[user]);
    const room = req.body.room;

    if (!matches.get(room)) return res.send({ joined: false })

    socket.join(room);
    rooms[user] = room;
    playing.push(user);

    res.send({ joined: true, match: matches.get(room) })
  } catch (err) {
    console.error(err);
  }
})

import winHandler from './server/winHandler.js'
app.post("/app-api/move", authenticateToken, (req, res) => {
  const user = req.body.user;
  const socket = io.sockets.sockets.get(sockets[user]);
  const room = req.body.room;
  const match = matches.get(room);

  if (match.turn != user) return res.send({ moved: false })

  console.log(`${match.turn} moving from ${req.body.from} to ${req.body.to}`)

  if (io.sockets.adapter.rooms.get(room).size != 2) {
    console.log(`NOT ALL USERS CONNECTED TO ${room}. ROOM LENGTH: ${io.sockets.adapter.rooms.get(room).size}`)
    return res.send({ moved: false, notAllUsersConnected: true })
  }

  var move;
  // if ( req.body.moving.replace(/[0-9]/g, '').toUpperCase() == "P") move = req.body.moveTo
  move = req.body.moving + req.body.moveTo
  var moveStatus = false;

  try {
    console.log({ from: req.body.from, to: req.body.to, piece: req.body.moving.replace(/[0-9]/g, '').toLowerCase(), color: req.body.c })

    match.board.move({ from: req.body.from, to: req.body.to, piece: req.body.moving.replace(/[0-9]/g, '').toLowerCase(), color: req.body.c }) // put a black pawn on a5

    moveStatus = true;
  } catch (err) {
    console.error("invalid move! (" + move + ")")
    moveStatus = false;
  }
  finally {
    var gameStatus = false;

    winHandler.isWin(match.board, (status, reason) => {
      console.log(status, reason)
      gameStatus = true;
      if (reason == "checkmate") io.to(room).emit("game-win", { winner: match.turn, reason: reason });
      else io.to(room).emit("game-end", { reason: reason, status: status })

      ratings.changeUser(match.turn, match.winAmt, "add");
      for (let i = 0; i < match.players.length; i++) {
        if (match.players[i] != match.turn) {
          ratings.changeUser(match.players[i], match.loseAmt, "sub")
        }
      }


      if (status) matches.delete(room)
      res.send({ moved: moveStatus })

      io.to(room).emit("recieve-move", { moveTo: req.body.moveTo, moving: req.body.moving, match: match, inCheck: match.board.inCheck() });
      return;
    })

    if (gameStatus) return;

    if (moveStatus) {
      for (let i = 0; i < match.players.length; i++) {
        if (match.players[i] == user) continue;
        match.turn = match.players[i]
      }
    }

    if (moveStatus) io.to(room).emit("recieve-move", { moveTo: req.body.moveTo, moving: req.body.moving, match: match, inCheck: match.board.inCheck() });

    if (!gameStatus) res.send({ moved: moveStatus })
  }

})

// Register/login

import accounts from "./server/accounts.js"
import ratings from './server/ratings.js'

app.post("/app-api/register", (req, res) => {
  try {
    if (req.body.username.replaceAll(" ", "") == "" || req.body.password.replaceAll(" ", "") == "") return;
    accounts.register(req.body.username, req.body.password, (created) => {
      if (created) {
        const token = tokenManager.createToken(req.body.username);
        res.cookie("token", token);
        res.send({ created: true, username: req.body.username })
      } else {
        res.send({ created: false });
      }
    })
  } catch (err) {
    console.error(err);
  }
})

app.post('/app-api/get-user-ratings', authenticateToken, (req, res) => {
  if (req.body.user.replaceAll(" ", "") == "") return;
  ratings.getRating(req.body.user, (rating) => {
    res.send({ rating: rating });
  })
})

app.post("/app-api/leave-queue", authenticateToken, (req, res) => {
  if (queueUsers.length == 2) return;
  queueUsers = [];
  io.emit("update_queue", { amount: arrayLength(queueUsers) });
  res.send({ left: true })
})

app.post("/app-api/sendMsg", authenticateToken, (req, res) => {
  const from = res.user;
  const content = req.body.content;

  if (content.replaceAll(" ", "") == "") return;
  io.to(rooms[from]).emit("recieve-msg", { content: content, from: from })
  res.status(200).send({ sent: true })
})

const portAbove = process.env.portAbove;
server.listen(port, () => {
  console.log("\x1b[33mServer Running!")
  console.log("\x1b[31mThis is a development server, do not use this for hosting!\n")
  console.log(`\x1b[0mRunning on:\nhttp://localhost:${port}\nhttps://chessapp.darthvader1925.repl.co (Public Host)`)
  console.log("WSS PORT: " + process.env.wssPort)
})

import wssF from './wss.js'
//wss.init();

import WebSocket from 'ws';
const wss = new WebSocket.Server({ port: process.env.wssPort });
import tokens from './server/tokens.js'

const clients = new Map();

wss["broadcast"] = function (name, data) {
  [...clients.keys()].forEach((client) => {
    client.send(JSON.stringify([{ name: name}, data]));
  });
}

wss.on("connection", (ws) => {
  // Set data
  const id = tokens.createRandomId(26);
  clients.set(ws, id);
  ws["id"]=id;
  wssF.setClient(ws, id)

  ws.on('message', (data) => {
    wssF.on(ws, JSON.parse(data));
    wss.broadcast({ name: "hola"} , "b")
  })

  ws.on("close", () => {
    clients.delete(ws);
    wssF.deleteClient(ws);
  });

  ws.onerror = function () {
    console.log('websocket error')
  }
})

function putSockets(user, id) {
  sockets[user] = id;
}

export default { clients, putSockets };

/*io.on("connection", (socket) => {

  socket.on("establish-connection", (data) => {
    console.log("Established WSS connection " + socket.id + " " + data.username)
    sockets[data.username] = socket.id;
    socket.emit("connection-established", {})
  })

  socket.on("disconnect", () => {
    var user;
    Object.getOwnPropertyNames(sockets).forEach((key) => {
      if (sockets[key] == socket.id) {
        if (playing.includes(key)) {
          user = key;
          console.log("MATCH THAT " + key + " IS PLAYING IN HAS DISCONNECTED.")

          // matches.remove()
        }
      }
    })

    if (queueUsers.includes(user)) {
      delete queueUsers[user];
      io.emit("update_queue", { amount: arrayLength(queueUsers) });
    }

    Object.values(sockets).forEach(function (key) {
      if (key == socket.id) {
        console.log("Removing " + key + " from socket array.")
        delete sockets[key]
      }
    });
  })
})

*/