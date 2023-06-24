'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');
const crypto = require('crypto');


// This function returns user's information given its id.
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id=?';
    db.get(sql, [id], (err, row) => {
      // if query error, reject the promise, otherwise if not found return an error else return the content
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        const user = { id: row.id, email: row.email, isAdmin: row.isAdmin, username: row.username }
        resolve(user);
      }
    });
  });
};

// This function is used at log-in time to verify username and password.
exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email=?';
    db.get(sql, [email], (err, row) => {
      // if query error, reject the promise, otherwise if no changes return false else return the content
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      }
      else {
        const user = { id: row.id, email: row.email, isAdmin: row.isAdmin, username: row.username }

        // Check the hashes with an async call, this operation may be CPU-intensive (and we don't want to block the server)
        // if the check goes well return user otherwise false
        crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { 
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) 
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

// get all users, so all users name for letting the admin change the users
exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id,username FROM USERS';
    db.all(sql, [], (err, rows) => {
        // if query error, reject the promise, otherwise return the content
        if (err)
            reject(err);
        else {
            const users = rows.map(user => Object.assign({}, user));
            resolve(users);
        }
    });
});
};