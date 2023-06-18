import dayjs from "dayjs";
import { SERVER_URL } from "./components/Costants";

/*** Users APIs ***/

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
async function logIn(credentials) {
    const response = await fetch(SERVER_URL + '/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    }).catch(() => {throw {error: "Connection Error"}});
    if (response.ok) {
      // 200 status code, parse and return the object
      const user = await response.json();
      return ({
        id: user.id,
        email: user.username,
        isAdmin: user.isAdmin,
        username: user.name
      });
    } else {
      // json object provided by the server with the error
      const error = await response.json();
      throw error;
    }
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
async function getUserInfo() {
    const response = await fetch(SERVER_URL + '/sessions/current', {
      // this parameter specifies that authentication cookie must be forwared
      credentials: 'include'
    }).catch(() => {throw {error: "Connection Error"}});
    if (response.ok) {
      // 200 status code, parse and return the object
      const user = await response.json();
      return ({
        id: user.id,
        email: user.username,
        isAdmin: user.isAdmin,
        username: user.name
      });
    } else {
      // json object provided by the server with the error
      const error = await response.json();
      throw error;
    }
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
async function logOut() {
    const response = await fetch(SERVER_URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
    }).catch(() => {throw {error: "Connection Error"}});
    if (response.ok) {
      // 200 status code, parse and return the object
      const emptyUser = await response.json();
      return emptyUser;
    } else {
      // json object provided by the server with the error
      const error = await response.json();
      throw error;
    }
};

/**
 * This function is used to retrieve all the users of the application
 * It returns a JSON object with the users
 */
async function getUsers() {
  const response = await fetch(SERVER_URL + '/users', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  }).catch(() => {throw {error: "Connection Error"}});
  if (response.ok) {
    // 200 status code, return the object
    const users = await response.json();
    return users;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
};

/*** PAGES API ***/

/**
 * Getting from the server side and returning the list of all pages (backoffice).
*/

async function getPagesBackOffice() {
  const response = await fetch(SERVER_URL + '/pages/backoffice', {credentials: 'include'})
      .catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const pages = await response.json();
    return pages;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/**
 * Getting from the server side and returning the list of published pages (front office).
*/

async function getPagesFrontOffice() {
  const response = await fetch(SERVER_URL + '/pages/frontoffice').catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const pages = await response.json();
    return pages;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/**
 * Getting from the server side and returning a specific page, along with the blocks (backoffice).
*/

async function getPagesbyIdBackOffice(pageId) {
  const response = await fetch(SERVER_URL + `/pages/backoffice/${pageId}`, {credentials: 'include'})
      .catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const response_page = await response.json();
    return response_page;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/**
 * Getting from the server side and returning a specific only-published page, along with the blocks (frontoffice).
*/

async function getPagesbyIdFrontOffice(pageId) {
  const response = await fetch(SERVER_URL + `/pages/frontoffice/${pageId}`).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const response_page = await response.json();
    return response_page;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}


/**
 * Sending to the server side and saving a specific page, along with the blocks.
*/
async function createPage(page) {
  const response = await fetch(SERVER_URL + '/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(Object.assign({}, { userId: page.userId, title: page.title, creationDate: page.creationDate, publicationDate: page.publicationDate, blocks: page.blocks })),
  }).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const response_page = await response.json();
    return response_page;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/**
 * Sending to the server side and updating a specific page, along with the blocks.
*/
async function updatePage(page, pageId) {
  const response = await fetch(SERVER_URL + `/pages/${pageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(Object.assign({}, { id: page.id, userId: page.userId, title: page.title, creationDate: page.creationDate, publicationDate: page.publicationDate, blocks: page.blocks })),
  }).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const response_page = await response.json();
    return response_page;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/**
 * Sending to the server side and deleting a specific page, along with the blocks.
*/
async function deletePage(pageId) {
  const response = await fetch(SERVER_URL + `/pages/${pageId}`, {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  }).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const emptyPage = await response.json();
    return emptyPage;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/*** Website APIs ***/


/**
 * Getting from the server the website name.
*/
async function getWebsiteName() {
  const response = await fetch(SERVER_URL + '/websites').catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const website = await response.json();

    return website;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/**
 * Sending to the server side and updating the website name.
*/
async function updateWebsiteName(new_name) {
  const response = await fetch(SERVER_URL + `/websites/${new_name}`, {
    method: 'PUT',
    credentials: 'include'
  }).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const website = await response.json();
    
    return website;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/*** Images APIs ***/

/**
 * Getting from the server all the images relative path
*/
async function getAllImages() {
  const response = await fetch(SERVER_URL + '/images').catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const images = await response.json();
    
    return images;
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

const API = {logIn, getUserInfo, logOut, getUsers, getPagesBackOffice, getPagesFrontOffice, getPagesbyIdBackOffice, getPagesbyIdFrontOffice, createPage, updatePage, deletePage, getWebsiteName, updateWebsiteName, getAllImages};
export default API;