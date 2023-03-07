import sqlite3 from 'sqlite3'
sqlite3.verbose()
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenDb = new sqlite3.Database(path.join(__dirname, '../database/tokenDb.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

tokenDb.run(`CREATE TABLE IF NOT EXISTS tokens(token TEXT NOT NULL, username TEXT NOT NULL)`)

export default {
  createToken: function(username) {
    const token = this.createRandomId(26);
    console.log("CREATED TOKEN " + token)
    let insertdata = tokenDb.prepare(`INSERT INTO tokens VALUES(?,?)`);
    insertdata.run(token.toString(), username.toString())
    insertdata.finalize();
    return token;
  },
  createRandomId: function(length = 0) {
    if (!length) length = 26;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567891234567890';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      var c = characters.charAt(Math.floor(Math.random() * charactersLength));
      if (is_numeric(c) && counter == 0) c = "a"
      result += c;
      counter += 1;
    }
    return result;
  },
  verifyToken: function(token, callback) {
    tokenDb.get(`SELECT * FROM tokens WHERE token = ?`, [token], (err, row) => {
      if (err) {
        console.error(err);
        tokenDb.close();
      }
      if (row == null) return callback(false)
      res.user = row.username;
      res.token = token;
      return callback(true);
    })
  },
  deleteToken: function(token, callback) {
    tokenDb.run("DELETE FROM tokens WHERE token = ?", [token], (err) => {
      if (err) throw err;
      console.log(`removed token (${token}) database`)
      callback()
    })
  }
}

function is_numeric(str) {
  return /^\d+$/.test(str);
}