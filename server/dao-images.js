'use strict';

/* Data Access Object (DAO) module for accessing images data */

const db = require('./db');

// This function returns all the images relative path.
exports.getAllImages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM images';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const images = rows.map(image => Object.assign({}, image));
        resolve(images);
      }
    });
  });
};