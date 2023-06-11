'use strict';

/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');

const { param, check, validationResult, } = require('express-validator'); // validation middleware

const blocksDao = require('./dao-blocks'); // module for accessing the films table in the DB
const pagesDao = require('./dao-pages'); // module for accessing the films table in the DB
const usersDao = require('./dao-users'); // module for accessing the user table in the DB
const websiteDao = require('./dao-website'); // module for accessing the films table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

// static middleware to serve static contents through express
app.use(express.static('./public'));
/**
 * The "delay" middleware introduces some delay in server responses. To change the delay change the value of "delayTime" (specified in milliseconds).
 * This middleware could be useful for debug purposes, to enabling it uncomment the following lines.
 */
/*
const delay = require('express-delay');
app.use(delay(200,2000));
*/

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method usersDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await usersDao.getUser(username, password)
  if (!user)
    return callback(null, false, 'Incorrect username or password');

  return callback(null, user); // NOTE: user info in the session (all fields returned by usersDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return usersDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "ckmdnvvnkecwmoefmw",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = (errors) => {
  return [...new Set(errors.array().map((error) => error.path + ': ' + error.msg))];
};

/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from usersDao.getUser() in LocalStratecy Verify Fn
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Not authenticated' });
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

/*** PAGES API ***/
// GET /api/pages
// get all the information of the pages for the frontoffice
app.get('/api/pages', (req, res) => {
  // Get all the pages for the frontoffice visualization.
  pagesDao.getPages()
    // NOTE: "invalid dates" (i.e., missing dates) are set to null during JSON serialization
    .then(pages => res.json(pages))
    .catch((err) => res.status(500).json(err)); // always return a json and an error message
}
);

// GET /api/pages/<id>
// Get a specific page, identified by the id <id>, along with the associated blocks.
app.get('/api/pages/:id', [
  param('id').isInt()
], async (req, res) => {
  const errors = errorFormatter(validationResult(req)); // format error message
  if (errors.length !== 0) {
    return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
  }
  try {
    const pageId = req.params.id;
    const page = await pagesDao.getPage(pageId);
    if (page.error)
      return res.status(404).json(page);
    const blocks = await blocksDao.getBlocksByPageId(pageId);
    if (blocks.error)
      return res.status(404).json(blocks);

    // construct the returning object
    page.blocks = blocks;
    return res.json(page);
  } catch (err) {
    res.status(503).json({ error: `Error during the retrieve of page ${req.params.id}` });
  }
}
);

// POST /api/pages
// Create a new Page, along with the associated blocks.
app.post('/api/pages', isLoggedIn,
  [
    check('title').notEmpty(),
    // only date (first ten chars) and valid ISO
    check('creationDate').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }),
    check('publicationDate').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }).optional(),
    check('blocks.*.type').isIn(['Header', 'Paragraph', 'Image']),
    check('blocks.*.content').notEmpty(),
    check('blocks.*.blockOrder').isInt()
  ],
  async (req, res) => {
    const errors = errorFormatter(validationResult(req)); // format error message
    if (errors.length !== 0) {
      return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
    }
    try {
      const page = {
        userId: req.user.id,
        title: req.body.title,
        creationDate: req.body.creationDate,
        publicationDate: req.body.publicationDate,
      };

      // create the page
      const new_page = await pagesDao.insertPage(page);

      const blocks = req.body.blocks.map((block) => ({
        pageId: new_page.id,
        type: block.type,
        content: block.content,
        blockOrder: block.blockOrder
      }));

      // create the blocks
      const new_blocks = await Promise.all(blocks.map(async (block) => {
        return await blocksDao.insertBlock(block);
      }));

      // construct the returning object
      new_page.blocks = new_blocks;

      res.json(new_page);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of page: ${err}` });
    }
  }
);

// PUT /api/pages/<id>
// Update a Page, identified by the id <id>, along with the associated blocks.
app.put('/api/pages/:id',
  isLoggedIn,
  [
    param('id').isInt(),
    check('id').isInt(),
    check('title').notEmpty(),
    // only date (first ten chars) and valid ISO
    check('creationDate').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }),
    check('publicationDate').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }).optional(),
    check('blocks.*.id').optional().isInt(),
    check('blocks.*.pageId').isInt(),
    check('blocks.*.type').isIn(['Header', 'Paragraph', 'Image']),
    check('blocks.*.content').notEmpty(),
    check('blocks.*.blockOrder').isInt()
  ],
  async (req, res) => {

    const errors = errorFormatter(validationResult(req)); // format error message
    if (errors.length !== 0) {
      return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
    }

    if (req.body.id !== Number(req.params.id)) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }

    try {
      const page = {
        id: req.body.id,
        userId: req.user.id,
        title: req.body.title,
        creationDate: req.body.creationDate,
        publicationDate: req.body.publicationDate,
      };

      const blocks = req.body.blocks.map((block) => ({
        id: (block.id) ? block.id : undefined,
        pageId: page.id,
        type: block.type,
        content: block.content,
        blockOrder: block.blockOrder
      })).sort((a, b) => a.blockOrder - b.blockOrder);

      // additional check to make sure there are no blocks with same blockOrder
      //(should not happen for client purposes) 
      const same_order = blocks.some((element, index) => {
        return blocks.findIndex((el, idx) => el.blockOrder === element.blockOrder && idx !== index) !== -1;
      });

      if (same_order === true) {
        return res.status(422).json({ error: '2 Blocks have the same order.' });
      }

      // update the page
      const up_page = await pagesDao.updatePage(req.user.isAdmin, req.user.id, page.id, page);
      if (up_page.error)
        return res.status(404).json(up_page);

      const num_db_blocks = await blocksDao.getNumberOfBlocks(up_page.id);

      let db_blocks = blocks.slice(0, num_db_blocks);
      let new_db_blocks = [];
      let client_blocks = blocks.slice(num_db_blocks);
      let new_client_blocks = [];

      if (blocks.length > num_db_blocks) {
        // update blocks until num_db_blocks (db_blocks), insert the remaining ones (client_blocks)
        try {
          new_db_blocks = await Promise.all(db_blocks.map(async (block) => {
            return await blocksDao.updateBlock(block.id, block);
          }));
        } catch (error) {
          return res.status(404).json(error);
        }
        new_client_blocks = await Promise.all(client_blocks.map(async (block) => {
          return await blocksDao.insertBlock(block);
        }));
      } else if (blocks.length < num_db_blocks) {
        // update blocks until blocks.length (db_blocks), delete the remaining ones (num_db_blocks-db_blocks.length)
        try {
          new_db_blocks = await Promise.all(db_blocks.map(async (block) => {
            return await blocksDao.updateBlock(block.id, block);
          }));
        } catch (error) {
          return res.status(404).json(error);
        }
        const start_deletion_order = db_blocks.length + 1;
        const deletion = await blocksDao.deleteBlocksFromIncreasingOrder(up_page.id, start_deletion_order);
        if (deletion.error)
          return res.status(404).json(deletion);
      } else {
        // update all blocks (db_blocks)
        try {
          new_db_blocks = await Promise.all(db_blocks.map(async (block) => {
            return await blocksDao.updateBlock(block.id, block);
          }));
        } catch (error) {
          return res.status(404).json(error);
        }
      }

      // construct the returning object
      up_page.blocks = new_db_blocks.concat(new_client_blocks);

      res.json(up_page);
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of page ${req.params.id}: ${err}` });
    }
  }
);

// DELETE /api/pages/<id>
// Delete a Page, identified by the id <id>.
app.delete('/api/pages/:id',
  isLoggedIn,
  [
    param('id').isInt()
  ],
  async (req, res) => {
    const errors = errorFormatter(validationResult(req)); // format error message
    if (errors.length !== 0) {
      return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
    }
    try {
      // NOTE: if there is no film with the specified id, the delete operation is considered successful.
      const result = await pagesDao.deletePage(req.user.isAdmin, req.user.id, req.params.id);
      if (result == null)
        return res.status(200).json({});
      else
        return res.status(404).json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}: ${err} ` });
    }
  }
);

/*** Website APIs ***/

// GET /api/websites
// Get the website name.
app.get('/api/websites',
  async (req, res) => {
    try {
      const result = await websiteDao.getWebsiteName();
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the get of website name : ${err} ` });
    }
  }
);

// PUT /api/websites/<name>
// Update the website name.
app.put('/api/websites/:name',
  isLoggedIn,
  [
    param('name').notEmpty()
  ],
  async (req, res) => {
    const errors = errorFormatter(validationResult(req)); // format error message
    if (errors.length !== 0) {
      return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
    }
    try {
      const result = await websiteDao.updateWebsiteName(req.params.name, req.user.isAdmin);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the update of website name : ${err} ` });
    }
  }
);

// Activating the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));