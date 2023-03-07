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
//const helmet = require("helmet");
const port = process.env.port;
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


const chess = new Chess();
chess.move({ from: 'b2', to: 'b3', piece: 'p', color: 'white' }) // put a black pawn on a5
console.log(chess.ascii());


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

function createRandomId(length = 0) {
  if (!length) length = 26;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567891234567890';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    var c = characters.charAt(Math.floor(Math.random() * charactersLength));
    //if (is_numeric(c) && counter == 0) c = "a"
    result += c;
    counter += 1;
  }
  return result;
}


app.use('/app-api/', apiLimiter)

const matches = new Map();

class Match {
  constructor(id, players, black, white) {
    this.id = id;
    this.players = players;
    this.board = new Chess();
    this.black = black;
    this.white = white;
    this.turn = white
  }
}

var queueUsers = [];
const sockets = [];
const rooms = [];

app.use(cors(corsOptions));
app.use(express.static("static"))
app.set('socketio', io);
// app.use(morgan(':method :url :status :res[content-length] :response-time ms'))
app.use(express.json())

function rp(p) {
  return path.join(__dirname, p);
}

app.get("/", (req, res) => {
  res.sendFile(rp("html/queue.html"))
})

app.get("/play", (req, res) => {
  res.sendFile(rp("html/game.html"))
})

app.post("/app-api/join-queue", (req, res) => {
  const user = req.body.user;
  if (user.replaceAll(" ", "") == "") return;

  queueUsers.push(user);
  const socket = io.sockets.sockets.get(sockets[user]);
  socket.join("queue");
  // rooms[user] = "queue";
  res.send({ joined: true })

  setTimeout(() => {
    if (queueUsers.length == 2) {
      const id = createRandomId(26)
      io.to("queue").emit("join_game", { gameId: id });
      const match = new Match(id, queueUsers, queueUsers[0], queueUsers[1]);
      matches.set(queueUsers, match)
      matches.set(id, match);
      queueUsers = [];
    }
  }, 1000)

  io.emit("update_queue", { amount: queueUsers.length });
})

app.get("/app-api/get-queue-members", (req, res) => {
  res.send({ amount: queueUsers.length });
})

app.get("/play/:id", (req, res) => {
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

    res.send({ joined: true, match: matches.get(room) })
  } catch (err) {
    console.error(err);
  }
})

import winHandler from './server/winHandler.js'
app.post("/app-api/move", (req, res) => {
  const user = req.body.user;
  const socket = io.sockets.sockets.get(sockets[user]);
  const room = req.body.room;
  const match = matches.get(room);

  if (match.turn != user) return res.send({ moved: false })

  console.log(`${match.turn} moving from ${req.body.from} to ${req.body.to}`)

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
    console.log("IS CHECKMATE: " + match.board.isCheckmate())
    winHandler.isWin(match.board, (status, reason) => {
      console.log(status, reason)
    })

    if (moveStatus) {
      for (let i = 0; i < match.players.length; i++) {
        if (match.players[i] == user) continue;
        match.turn = match.players[i]
      }
    }

    if (moveStatus) io.to(room).emit("recieve-move", { moveTo: req.body.moveTo, moving: req.body.moving, match: match, inCheck: match.board.inCheck() });

    res.send({ moved: moveStatus })
  }

})

server.listen(port, () => {
  console.log("\x1b[33mServer Running!")
  console.log("\x1b[31mThis is a development server, do not use this for hosting!\n")
  console.log(`\x1b[0mRunning on:\nhttp://localhost:${port}\nhttps://chessapp.darthvader1925.repl.co`)
})

io.on("connection", (socket) => {

  socket.on("establish-connection", (data) => {
    console.log("Established WSS connection " + socket.id + " " + data.username)
    sockets[data.username] = socket.id;
    socket.emit("connection-established", {})
  })

  socket.on("disconnect", () => {
    Object.values(sockets).forEach(function (key) {
      if (key == socket.id) {
        console.log("Removing " + key + " from socket array.")
        delete sockets[key]
      }
    });
  })
})