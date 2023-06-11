'use strict';

/** DB access module **/

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('cmsmall.db', (err) => {
  if (err) throw err;
});

// Enable foreign keys by executing the PRAGMA statement
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');
});

module.exports = db;
