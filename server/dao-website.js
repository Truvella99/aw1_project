'use strict';

/* Data Access Object (DAO) module for accessing website data */

const db = require('./db');

// This function returns the website name.
exports.getWebsiteName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM website';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const WebSiteName = Object.assign({}, { name: rows[0].name })
        resolve(WebSiteName);
      }
    });
  });
};

// This function updates the website name.
exports.updateWebsiteName = (new_name,isAdmin) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE website SET name=? WHERE ?';
    db.run(sql, [new_name,isAdmin], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        resolve({ error: 'No name was updated.' });
      } else {
        resolve({ name: new_name });
      }
    });
  });
};