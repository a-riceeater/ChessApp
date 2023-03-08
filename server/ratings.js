import sqlite3 from 'sqlite3'
sqlite3.verbose();
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ratingDb = new sqlite3.Database(path.join(__dirname, '../database/ratingDb.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

ratingDb.run(`CREATE TABLE IF NOT EXISTS ratings(username TEXT NOT NULL, rating INTEGER NOT NULL)`)
Number.prototype.r = function () {
    return getRand(this, this + 5).toFixed();
}
export default {
    addUser: function (username, callback) {
        const startingRating = 400;
        let insertdata = ratingDb.prepare(`INSERT INTO ratings VALUES (?, ?)`);
        insertdata.run(username, startingRating);
        insertdata.finalize();
        callback(true)
    },
    getRating: function (username, callback) {
        ratingDb.get(`SELECT * FROM ratings WHERE username = ?`, [username], (err, row) => {
            if (err) throw err;
            if (row == null) return callback(null);
            return callback(row.rating)
        })
    },
    calculateWinDrawLose: function (username1, username2, callback) {
        var ratA, ratB, difference;
        getRating(username1, (rating) => ratA = parseInt(rating));
        getRating(username2, (rating) => ratB = parseInt(rating));
        difference = ratA - ratB;

        var winA, drawA, loseA;

        // If ratings are similar, increase by 10
        if (ratA == ratB || ratB == ratA) {
            winA = (10).r();
            drawA = (-3).r();
            loseA = (10).r();
            return callback({ win: winA, draw: drawA, lose: loseA })
        }

        if (difference < 50) {
            winA = (15).r();
            drawA = (3).r();
            loseA = (17).r();
            return callback({ win: winA, draw: drawA, lose: loseA })
        }

        if (difference > 49 && difference < 101) {
            winA = (23).r();
            drawA = (2).r();
            loseA = (14).r();
            return callback({ win: winA, draw: drawA, lose: loseA })
        }

        if (difference > 100) {
            winA = (28).r();
            drawA = (8).r();
            loseA = (16).r();
            return callback({ win: winA, draw: drawA, lose: loseA })
        }

        else {
            winA = (50).r();
            drawA = (14).r();
            loseA = (50).r();
            return callback({ win: winA, draw: drawA, lose: loseA })
        }
    }
}

function getRand(t, e) { return Math.random() * (e - t) + t }

function getRating(username, callback) {
    ratingDb.get(`SELECT * FROM ratings WHERE username = ?`, [username], (err, row) => {
        if (err) throw err;
        if (row == null) return callback(null);
        return callback(row.rating)
    })
}