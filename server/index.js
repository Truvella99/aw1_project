'use strict';

/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');
const dayjs = require('dayjs');
const { param, check, validationResult, } = require('express-validator'); // validation middleware

const blocksDao = require('./dao-blocks'); // module for accessing the blocks table in the DB
const pagesDao = require('./dao-pages'); // module for accessing the pages table in the DB
const usersDao = require('./dao-users'); // module for accessing the users table in the DB
const websiteDao = require('./dao-website'); // module for accessing the website table in the DB
const imagesDao = require('./dao-images'); // module for accessing the images table in the DB

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

// GET /api/authors
// This route is used to retrieve all the authors of the application if needed, admin only
app.get('/api/authors' ,(req,res) => {
  // Get all the authors
  usersDao.getAuthors()
    .then(authors => res.json(authors))
    .catch((err) => res.status(500).json(err)); // always return a json and an error message
}
);

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
    check('userId').isInt(),
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
      // check if user id exists
      const userId = req.body.userId;
      const user = await usersDao.getUserById(userId);
      if (user.error)
        return res.status(404).json(user);
      // check if this id is the same of authenticated user (not an Admin), otherwise it's ok
      if(!req.user.isAdmin && userId !== req.user.id) {
        return res.status(422).json({ error: "Cannot Create a Page for Other Users"});
      }

      // check if publication date is before creation date 
      if (req.body.publicationDate && dayjs(req.body.publicationDate).isBefore(dayjs(req.body.creationDate),'day')) {
        return res.status(422).json({ error: "Cannot Create a Page with misleading dates"});
      }

      const page = {
        userId: userId,
        title: req.body.title,
        creationDate: req.body.creationDate,
        publicationDate: req.body.publicationDate,
      };

      const blocks = req.body.blocks.map((block) => ({
        pageId: undefined,
        type: block.type,
        content: block.content,
        blockOrder: block.blockOrder
      })).sort((a, b) => a.blockOrder - b.blockOrder);

      // check that there is at least one header blocks and another block
      if (blocks.length < 2 || blocks.every((block) => block.type !== 'Header')) {
        return res.status(422).json({ error: "Blocks Costraint Not Respected"});
      }

      // additional check to make sure there are no blocks with same blockOrder
      const same_order = blocks.some((element, index) => {
        return blocks.findIndex((el, idx) => el.blockOrder === element.blockOrder && idx !== index) !== -1;
      });

      if (same_order === true) {
        return res.status(422).json({ error: '2 Blocks have the same order.' });
      }

      // check that the blocks of type Image have a content that is into the image table
      const images = await imagesDao.getAllImages();

      let wrongImageContent;

      blocks.forEach((block) => {
          if (block.type === "Image" && !images.some(image => image.name === block.content)) {
            wrongImageContent = block.content;
          }
      });

      if (wrongImageContent) {
        return res.status(422).json({ error: `Image Block have mismatched content: ${wrongImageContent}.` });
      }

      // create the page
      const new_page = await pagesDao.insertPage(page);

      // create the blocks
      const new_blocks = await Promise.all(blocks.map(async (block) => {
        block.pageId = new_page.id;
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

// POST /api/pages/<id>
// Update a Page, identified by the id <id>, along with the associated blocks.
app.post('/api/pages/:id',
  isLoggedIn,
  [
    check('userId').isInt(),
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
      // check if user id exists
      const userId = req.body.userId;
      const user = await usersDao.getUserById(userId);
      if (user.error)
        return res.status(404).json(user);
      // check if this id is the same of authenticated user (not an Admin), otherwise it's ok
      if(!req.user.isAdmin && userId !== req.user.id) {
        return res.status(422).json({ error: "Cannot Update a Page for Other Users"});
      }

      // check if publication date is before creation date 
      if (req.body.publicationDate && dayjs(req.body.publicationDate).isBefore(dayjs(req.body.creationDate),'day')) {
        return res.status(422).json({ error: "Cannot Update a Page with misleading dates"});
      }

      const page = {
        id: req.body.id,
        userId: userId,
        title: req.body.title,
        creationDate: req.body.creationDate,
        publicationDate: req.body.publicationDate,
      };

      const blocks = req.body.blocks.map((block) => ({
        pageId: page.id,
        type: block.type,
        content: block.content,
        blockOrder: block.blockOrder
      })).sort((a, b) => a.blockOrder - b.blockOrder);

      // check that there is at least one header blocks and another block
      if (blocks.length < 2 || blocks.every((block) => block.type !== 'Header')) {
        return res.status(422).json({ error: "Blocks Costraint Not Respected"});
      }

      // additional check to make sure there are no blocks with same blockOrder
      const same_order = blocks.some((element, index) => {
        return blocks.findIndex((el, idx) => el.blockOrder === element.blockOrder && idx !== index) !== -1;
      });

      if (same_order === true) {
        return res.status(422).json({ error: '2 Blocks have the same order.' });
      }

      // check that the blocks of type Image have a content that is into the image table
      const images = await imagesDao.getAllImages();

      let wrongImageContent;
      
      blocks.forEach((block) => {
          if (block.type === "Image" && !images.some(image => image.name === block.content)) {
            wrongImageContent = block.content;
          }
      });

      if (wrongImageContent) {
        return res.status(422).json({ error: `Image Block have mismatched content: ${wrongImageContent}.` });
      }

      // update the page
      const up_page = await pagesDao.updatePage(req.user.isAdmin, req.user.id, page.id, page);
      if (up_page.error)
        return res.status(404).json(up_page);

      // delete all blocks of the page
      const num_deleted = await blocksDao.deleteAllPageBlocks(up_page.id);
      if (num_deleted.error)
        return res.status(404).json(num_deleted);

      // insert the blocks from scratch
      const new_blocks = await Promise.all(blocks.map(async (block) => {
        return await blocksDao.insertBlock(block);
      }));

      // construct the returning object
      up_page.blocks = new_blocks;

      // return it
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
      // NOTE: if there is no pages with the specified id, the delete operation is considered successful.
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

/*** Images APIs ***/

// GET /api/images
// Get all the images relative path
app.get('/api/images',
  async (req, res) => {
    try {
      const result = await imagesDao.getAllImages();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the get of all images : ${err} ` });
    }
  }
);

// Activating the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));