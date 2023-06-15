'use strict';

/* Data Access Object (DAO) module for accessing blocks data */

const db = require('./db');

// This function returns all blocks of a given page.
exports.getBlocksByPageId = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM blocks WHERE pageId=?';
        db.all(sql, [pageId], (err, rows) => {
            if (err)
                reject(err);
            else {
                const blocks = rows.map(block => Object.assign({}, block));
                resolve(blocks);
            }
        });
    });
};

// NON USATA
// this function returns the number of blocks of a given page
exports.getNumberOfBlocks = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) FROM blocks WHERE pageId = ?';
        db.get(sql, [pageId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const count = row['COUNT(*)'];
                resolve(count);
            }
        });
    });
};

// NON USATA
// This function return a specific block given its id.
exports.getBlock = (blockId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM blocks WHERE id=?';
        db.get(sql, [blockId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 'Block not found.' });
            }
            else {
                const block = Object.assign({}, row);
                resolve(block);
            }
        });
    });
};

// This function create a new block.
exports.insertBlock = (block) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO blocks (pageId, type, content, blockOrder) VALUES(?, ?, ?, ?)';
        db.run(sql, [block.pageId,block.type,block.content,block.blockOrder], function (err) {
            if (err) {
                reject(err);
            } else {
                // Returning the newly created object with the DB additional properties to the client.
                resolve(exports.getBlock(this.lastID));
            }
        });
    });
};

// NON USATA
// This function updates a block.
exports.updateBlock = (blockId,block) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE blocks SET pageId=?, type=?, content=?, blockOrder=? WHERE id=?';
        db.run(sql, [block.pageId,block.type,block.content,block.blockOrder,blockId], function (err) {
            if (err) {
                reject(err);
            }
            if (this.changes !== 1) {
                resolve({ error: 'No block was updated.' });
            } else {
                // Returning the newly created object with the DB additional properties to the client.
                resolve(exports.getBlock(blockId));
            }
        });
    });
};

// This function deletes an existing block given its id.
exports.deleteAllPageBlocks = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM blocks WHERE pageId=?';
        db.run(sql, [pageId], function (err) {
            if (err) {
                reject(err);
            }
            if (this.changes === 0)
                resolve({ error: 'No blocks deleted.' });
            else
                resolve(this.changes);
        });
    });
};
