'use strict';

/* Data Access Object (DAO) module for accessing pages data */

const db = require('./db');

// This function returns all pages.
exports.getPages = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT pages.id,userId,username,title,creationDate,publicationDate FROM pages,users WHERE pages.userId=users.id ORDER BY publicationDate';
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const pages = rows.map(page => Object.assign({}, page));
                resolve(pages);
            }
        });
    });
};

// This function return a specific page given its id.
exports.getPage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT pages.id,userId,username,title,creationDate,publicationDate FROM pages,users WHERE pages.userId=users.id AND pages.id=?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 'Page not found.' });
            }
            else {
                const page = Object.assign({}, row);
                resolve(page);
            }
        });
    });
};

// This function create a new page.
exports.insertPage = (page) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO pages (userId, title, creationDate, publicationDate) VALUES(?, ?, ?, ?)';
        db.run(sql, [page.userId, page.title, page.creationDate, page.publicationDate], function (err) {
            if (err) {
                reject(err);
            } else {
                // Returning the newly created object with the DB additional properties to the client.
                resolve(exports.getPage(this.lastID));
            }
        });
    });
};

// This function updates a page.
// Also to change the author of an existing page given its id. (ADMIN ONLY)
exports.updatePage = (isAdmin,userId,pageId,page) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE pages SET userId=?, title=?, creationDate=?, publicationDate=? WHERE id=? AND (userId=? OR ?)';
        db.run(sql, [page.userId, page.title, page.creationDate, page.publicationDate,pageId,userId,isAdmin], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes !== 1) {
                resolve({ error: 'No page was updated.' });
            } else {
                // Returning the newly updated object with the DB additional properties to the client.
                resolve(exports.getPage(pageId));
            }
        });
    });
};

// This function deletes an existing page given its id.
exports.deletePage = (isAdmin,userId, pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM pages WHERE id=? and (userId=? OR ?)';
        db.run(sql, [pageId, userId, isAdmin], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes !== 1) {
                resolve({ error: 'No page deleted.' });
            } else {
                resolve(null);
            }
        });
    });
};
