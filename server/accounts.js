import sqlite3 from 'sqlite3'
sqlite3.verbose();
import path from 'path'
import ratings from './ratings.js'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountDb = new sqlite3.Database(path.join(__dirname, '../database/accounts.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
import dotenv from 'dotenv'
import CryptoJS from "crypto-js";
dotenv.config();

accountDb.run(`CREATE TABLE IF NOT EXISTS accounts(username TEXT NOT NULL, password TEXT NOT NULL)`)

export default {
  register: function(username, password, callback) {
    accountDb.get(`SELECT * FROM accounts WHERE username = ?`, [username], (err, row) => {
      if (err) throw err;
      if (row != null) return callback(false);

      let insertdata = accountDb.prepare("INSERT INTO accounts VALUES(?, ?)");
      insertdata.run(encryptData(username), encryptData(password))
      insertdata.finalize();

      ratings.addUser(username, () => {
        callback(true);
      });
    })
  },
  login: function(email, password, callback) {

  }
}

function encryptData(data) {
  return CryptoJS.AES.encrypt(data, process.env.accountEncryptionKey).toString();
}

function decryptData(data) {
  const bytes = CryptoJS.AES.decrypt(data, process.env.accountEncryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}