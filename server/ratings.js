import sqlite3 from 'sqlite3'
sqlite3.verbose();
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ratingDb = new sqlite3.Database(path.join(__dirname, '../database/ratingDb.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

ratingDb.run(`CREATE TABLE IF NOT EXISTS ratings(username TEXT NOT NULL, rating INTEGER NOT NULL)`)

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
    
}