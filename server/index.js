'use strict';

/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');
const dayjs = require('dayjs');
const { param, check, validationResult } = require('express-validator'); // validation middleware
const fs = require('fs');
const path = require('path');
const blocksDao = require('./dao-blocks'); // module for accessing the blocks table in the DB
const pagesDao = require('./dao-pages'); // module for accessing the pages table in the DB
const usersDao = require('./dao-users'); // module for accessing the users table in the DB
const websiteDao = require('./dao-website'); // module for accessing the website table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

// static middleware to serve static contents through express
app.use(express.static('./public'));
const staticFolderPath = path.join(__dirname, 'public/images');
const getImagesName = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(staticFolderPath, (err, files) => {
      if (err) {
        reject({ error: 'Error reading directory for getting all images.' });
        return;
      }

      // files contains all the names of the images inside the public/images folder
      resolve(files);
    });
  });
};

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
passport.use(new LocalStrategy(async function verify(email, password, callback) {
  const user = await usersDao.getUser(email, password)
  if (!user)
    return callback(null, false, 'Incorrect email or password');

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
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
  req.logout(() => {
    res.status(200).json(null);
  });
});

// GET /api/users
// This route is used to retrieve all the users of the application if needed, admin only
app.get('/api/users', isLoggedIn 
  ,(req, res) => {
  // if not admin, return permission denied error
  if(!req.user.isAdmin) {
    return res.status(403).json({ error: "Cannot Get all The Users." });
  }
  // Get all the users
  usersDao.getUsers()
    .then(authors => res.json(authors))
    .catch(() => res.status(503).json({error: 'Database Error in Retrieving all Users'}));
}
);

/*** PAGES API ***/


// GET /api/pages/backoffice
// get all the information of the pages for the backoffice
app.get('/api/pages/backoffice',
  isLoggedIn,
  (req, res) => {
    // Get all the pages for the backoffice visualization.
    pagesDao.getPages()
      // NOTE: "invalid dates" (i.e., missing dates) are set to null during JSON serialization
      .then(pages => res.json(pages))
      .catch(() => res.status(503).json({error: 'Database Error in retrieving Pages'}));
  }
);

// GET /api/pages/frontoffice
// get all the information of the pages for the frontoffice
app.get('/api/pages/frontoffice',
  (req, res) => {
    // Get all the pages for the frontoffice visualization.
    pagesDao.getPages()
      // NOTE: "invalid dates" (i.e., missing dates) are set to null during JSON serialization
      .then(pages => {
        // filter and obtain only publicated pages
        const front_pages = pages.filter((page) => {
          const today = dayjs();
          const publicationDate = dayjs(page.publicationDate);
          if (publicationDate.isBefore(today, 'day') || publicationDate.isSame(today, 'day')) {
            return true;
          }
          return false;
        });
        return res.json(front_pages);
      })
      .catch(() => res.status(503).json({error: 'Database Error in retrieving Pages'}));
  }
);


// GET /api/pages/<id>
// Get a specific page, identified by the id <id>, along with the associated blocks.
// Authenticated (it's possible to retrieve all pages)
app.get('/api/pages/backoffice/:id',
  isLoggedIn,
  [
    param('id').isInt()
  ], async (req, res) => {
    const errors = errorFormatter(validationResult(req)); // format error message
    if (errors.length !== 0) {
      return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
    }
    try {
      // check if the page exists
      const pageId = req.params.id;
      const page = await pagesDao.getPage(pageId).catch(() => { throw {unavailable: `Database Error in retrieving Page ${pageId}`}});
      if (page.error)
        return res.status(404).json(page);

      // retrieve the blocks of the page
      const blocks = await blocksDao.getBlocksByPageId(pageId).catch(() => { throw {unavailable: `Database Error in retrieving Blocks of Page ${pageId}`}});
      if (blocks.error)
        return res.status(404).json(blocks);

      // construct the returning object
      page.blocks = blocks;
      return res.json(page);
    } catch (err) {
      if (err.unavailable)
        res.status(503).json({error: err.unavailable});
      else
        res.status(500).json({ error: `Error during the retrieve of page ${req.params.id}` });
    }
  }
);


// GET /api/pages/<id>
// Get a specific page, identified by the id <id>, along with the associated blocks.
// Not authenticated (it's only possible to retrieve published pages)
app.get('/api/pages/frontoffice/:id', [
  param('id').isInt()
], async (req, res) => {
  const errors = errorFormatter(validationResult(req)); // format error message
  if (errors.length !== 0) {
    return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
  }
  try {
    // check if the page exists
    const pageId = req.params.id;
    const page = await pagesDao.getPage(pageId).catch(() => { throw {unavailable: `Database Error in retrieving Page ${pageId}`}});
    if (page.error)
      return res.status(404).json(page);
    // check that is published, otherwise return permission denied
    const publicationDate = dayjs(page.publicationDate);
    const today = dayjs();
    if (!(publicationDate.isBefore(today, 'day') || publicationDate.isSame(today, 'day'))) {
      return res.status(403).json({ error: "Don't Have permissions to retrieve this Page." });
    }
    // retrieve the blocks of the page
    const blocks = await blocksDao.getBlocksByPageId(pageId).catch(() => { throw {unavailable: `Database Error in retrieving Blocks of Page ${pageId}`}});
    if (blocks.error)
      return res.status(404).json(blocks);

    // construct the returning object
    page.blocks = blocks;
    return res.json(page);
  } catch (err) {
    if (err.unavailable)
      res.status(503).json({error: err.unavailable});
    else
      res.status(500).json({ error: `Error during the retrieve of page ${req.params.id}` });
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
      const user = await usersDao.getUserById(userId).catch(() => { throw {unavailable:`Database Error in retrieving User ${userId}`}});
      if (user.error)
        return res.status(404).json(user);
      // check if this id is the same of authenticated user (not an Admin), otherwise it's ok
      if (!req.user.isAdmin && userId !== req.user.id) {
        return res.status(403).json({ error: "Cannot Create a Page for Other Users" });
      }

      // check if publication date is before creation date 
      if (req.body.publicationDate && dayjs(req.body.publicationDate).isBefore(dayjs(req.body.creationDate), 'day')) {
        return res.status(422).json({ error: "Cannot Create a Page with misleading dates" });
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
        return res.status(422).json({ error: "Blocks Costraint Not Respected" });
      }

      // additional check to make sure there are no blocks with same blockOrder
      const same_order = blocks.some((element, index) => {
        return blocks.findIndex((el, idx) => el.blockOrder === element.blockOrder && idx !== index) !== -1;
      });

      if (same_order === true) {
        return res.status(422).json({ error: '2 Blocks have the same order.' });
      }

      // check that there are no missing order in the block => (ex. blockorder,1,2,3,5)
      let wrongOrders = [];
      blocks.forEach((block,index) => {
        if (block.blockOrder != index + 1) {
          wrongOrders.push(block.blockOrder);
        }
      });

      if (wrongOrders.length !== 0) {
        return res.status(422).json({ error: `Wrong Block order: ${wrongOrders.join(' , ')}.`});
      }

      // check that the blocks of type Image have a content that is into the image table
      const images = await getImagesName().catch(() => { throw {unavailable: 'Server: Unable to Retrieve all Images'}});
      if (images.error)
        return res.status(404).json(images);

      let wrongImageContent = [];

      blocks.forEach((block) => {
        if (block.type === "Image" && !images.some(image => image === block.content)) {
          wrongImageContent.push(block.content);
        }
      });

      if (wrongImageContent.length !== 0) {
        return res.status(422).json({ error: `Image Block have mismatched content: ${wrongImageContent.join(' , ')}.` });
      }

      // create the page
      const new_page = await pagesDao.insertPage(page).catch(() => { throw {unavailable: 'Database Error in creating Page'}});

      // create the blocks
      const new_blocks = await Promise.all(blocks.map(async (block) => {
        block.pageId = new_page.id;
        return await blocksDao.insertBlock(block).catch(() => { throw {unavailable: `Database Error in creating Blocks`}});
      }));

      // construct the returning object
      new_page.blocks = new_blocks;

      res.json(new_page);
    } catch (err) {
      if (err.unavailable)
        res.status(503).json({error: err.unavailable});
      else
        res.status(500).json({ error: 'Error during the creation of page' });
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
    check('blocks.*.type').isIn(['Header', 'Paragraph', 'Image']),
    check('blocks.*.content').notEmpty(),
    check('blocks.*.blockOrder').isInt()
  ],
  async (req, res) => {

    const errors = errorFormatter(validationResult(req)); // format error message
    if (errors.length !== 0) {
      return res.status(422).json({ error: errors.join(", ") }); // error message is a single string with all error joined together
    }

    if (req.body.id != req.params.id) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }

    try {
      // check if user id exists
      const userId = req.body.userId;
      const user = await usersDao.getUserById(userId).catch(() => { throw {unavailable: `Database Error in retrieving User ${userId}`}});
      if (user.error)
        return res.status(404).json(user);
      // check if this id is the same of authenticated user (not an Admin), otherwise it's ok
      if (!req.user.isAdmin && userId !== req.user.id) {
        return res.status(403).json({ error: "Cannot Update a Page for Other Users" });
      }

      // check if publication date is before creation date 
      if (req.body.publicationDate && dayjs(req.body.publicationDate).isBefore(dayjs(req.body.creationDate), 'day')) {
        return res.status(422).json({ error: "Cannot Update a Page with misleading dates" });
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
        return res.status(422).json({ error: "Blocks Costraint Not Respected" });
      }

      // additional check to make sure there are no blocks with same blockOrder
      const same_order = blocks.some((element, index) => {
        return blocks.findIndex((el, idx) => el.blockOrder === element.blockOrder && idx !== index) !== -1;
      });

      if (same_order === true) {
        return res.status(422).json({ error: '2 Blocks have the same order.' });
      }

      // check that there are no missing order in the block => (ex. blockorder,1,2,3,5)
      let wrongOrders = [];
      blocks.forEach((block,index) => {
        if (block.blockOrder != index + 1) {
          wrongOrders.push(block.blockOrder);
        }
      });

      if (wrongOrders.length !== 0) {
        return res.status(422).json({ error: `Wrong Block order: ${wrongOrders.join(' , ')}.`});
      }

      // check that the blocks of type Image have a content that is into the image table
      const images = await getImagesName().catch(() => { throw {unavailable: 'Server: Unable to retrieve all Images'}});
      if (images.error)
        return res.status(404).json(images);

      let wrongImageContent = [];

      blocks.forEach((block) => {
        if (block.type === "Image" && !images.some(image => image === block.content)) {
          wrongImageContent.push(block.content);
        }
      });

      if (wrongImageContent.length !== 0) {
        return res.status(422).json({ error: `Image Block have mismatched content: ${wrongImageContent.join(' , ')}.` });
      }

      // update the page
      const up_page = await pagesDao.updatePage(req.user.isAdmin, req.user.id, page.id, page).catch(() => { throw {unavailable: `Database Error in Updating Page ${page.id}`}});
      if (up_page.error)
        return res.status(404).json(up_page);

      // delete all blocks of the page
      const num_deleted = await blocksDao.deleteAllPageBlocks(up_page.id).catch(() => { throw {unavailable: `Database Error in Deleting all Blocks of Page ${up_page.id}`}});
      if (num_deleted.error)
        return res.status(404).json(num_deleted);

      // insert the blocks from scratch
      const new_blocks = await Promise.all(blocks.map(async (block) => {
        return await blocksDao.insertBlock(block).catch(() => { throw {unavailable: 'Database Error in Inserting new Blocks From Scratch'}});
      }));

      // construct the returning object
      up_page.blocks = new_blocks;

      // return it
      res.json(up_page);
    } catch (err) {
      if (err.unavailable)
        res.status(503).json({error: err.unavailable});
      else
        res.status(500).json({ error: `Error during the update of page ${req.params.id}` });
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
      // check that the page you want to delete exist
      // if the page exist and has not been cancelled, then it is a permission denied error
      const page_exist = await pagesDao.getPage(req.params.id).catch(() => { throw {unavailable: `Database Error in retrieving Page ${req.params.id}`}});
      // if page does not exist return 404 not found error
      if (!page_exist.error) {
        // page exist, delete it (ON DELETE CASCADE, SO DELETE ALSO THE BLOCKS)
        const result = await pagesDao.deletePage(req.user.isAdmin, req.user.id, req.params.id).catch(() => { throw {unavailable: `Database Error in Deleting Page ${req.params.id} and relative Blocks`}});
        if (result === null)
          return res.status(200).json(null);
        else
          // page exist and has not been deleted, permission error
          return res.status(403).json({ error: "Cannot Delete a Page for Other Users" });
      } else {
          return res.status(404).json(page_exist);
      }
    } catch (err) {
      if (err.unavailable)
        res.status(503).json({error: err.unavailable});
      else
        res.status(500).json({ error: `Error during the deletion of page ${req.params.id}` });
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
      res.status(503).json({ error: `Database error in retrieving the website name` });
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
      // if not admin return permission denied error
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Cannot Update Website Name." });
      }
      const result = await websiteDao.updateWebsiteName(req.params.name, req.user.isAdmin).catch(() => { throw {unavailable: 'Database error during the update of website name'}});
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      if (err.unavailable)
        res.status(503).json({error: err.unavailable});
      else
        res.status(500).json({ error: 'Error during the updating of website name' });
    }
  }
);

/*** Images APIs ***/

// GET /api/images
// Get all the images relative path
app.get('/api/images',
  async (req, res) => {
    try {
      const result = await getImagesName();
      res.json(result);
    } catch (err) {
      res.status(503).json({error: 'Server: Unable to Retrieve all Images'});
    }
  }
);

// Activating the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));