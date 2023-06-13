import dayjs from "dayjs";

const SERVER_URL = 'http://localhost:3001/api';

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
 * Getting from the server side and returning the list of pages.
*/

async function getPages() {
  const response = await fetch(SERVER_URL + '/pages').catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const pages = await response.json();
    return pages.map((page) => (
      {
        id: page.id,
        userId: page.userId,
        username: page.username,
        title: page.title,
        creationDate: dayjs(page.creationDate),
        publicationDate: dayjs(page.publicationDate),
      }));
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}

/**
 * Getting from the server side and returning a specific page, along with the blocks.
*/

async function getPagesbyId(pageId) {
  const response = await fetch(SERVER_URL + `/pages/${pageId}`).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const page_json = await response.json();
    const page = {
      id: page_json.id,
      userId: page_json.userId,
      username: page.username,
      title: page_json.title,
      creationDate: dayjs(page_json.creationDate),
      publicationDate: dayjs(page_json.publicationDate)
    };
    page.blocks = page_json.blocks.map((block) => {
      return (
        {
          id: block.id,
          pageId: block.pageId,
          type: block.type,
          content: block.content,
          blockOrder: block.blockOrder
        })
    });
    return page;
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
    body: JSON.stringify(Object.assign({}, { title: page.title, creationDate: page.creationDate.format("YYYY-MM-DD"), publicationDate: (page.publicationDate ? page.publicationDate.format("YYYY-MM-DD") : undefined), blocks: page.blocks })),
  }).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const page_json = await response.json();
    const page = {
      id: page_json.id,
      userId: page_json.userId,
      title: page_json.title,
      creationDate: dayjs(page_json.creationDate),
      publicationDate: dayjs(page_json.publicationDate)
    };
    page.blocks = page_json.blocks.map((block) => {
      return (
        {
          id: block.id,
          pageId: block.pageId,
          type: block.type,
          content: block.content,
          blockOrder: block.blockOrder
        })
    });
    return page;
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
    body: JSON.stringify(Object.assign({}, { id: page.id, title: page.title, creationDate: page.creationDate.format("YYYY-MM-DD"), publicationDate: (page.publicationDate ? page.publicationDate.format("YYYY-MM-DD") : undefined), blocks: page.blocks })),
  }).catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const page_json = await response.json();
    const page = {
      id: page_json.id,
      userId: page_json.userId,
      title: page_json.title,
      creationDate: dayjs(page_json.creationDate),
      publicationDate: dayjs(page_json.publicationDate)
    };
    page.blocks = page_json.blocks.map((block) => {
      return (
        {
          id: block.id,
          pageId: block.pageId,
          type: block.type,
          content: block.content,
          blockOrder: block.blockOrder
        })
    });
    return page;
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


/**
 * Getting from the server the website name.
*/
async function getWebsiteName() {
  const response = await fetch(SERVER_URL + '/websites').catch(() => { throw { error: "Connection Error" } });
  if (response.ok) {
    // 200 status code, parse and return the object
    const website = await response.json();
    return {
      name: website.name
    };
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
    return {
      name: website.name
    };
  } else {
    // json object provided by the server with the error
    const error = await response.json();
    throw error;
  }
}


const API = {logIn, getUserInfo, logOut, getPages, getPagesbyId, createPage, updatePage, deletePage, getWebsiteName, updateWebsiteName};
export default API;