[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/suhcjUE-)
# Exam #1: "CMSMALL"
## Student: s310454 GAGLIARDO DOMENICO 

## React Client Application Routes

- Route `/`  : main web page that contains the published pages available in the application (front office).
- Route `/backoffice`  : web page that contains all the pages available in the application, available only if logged in (back office).
- Route `/login`  : web page used to display the login form, in blockOrder to perform the login
- Route `/pages/add`  : web page that contains an empty page structure, used to create a page for a certain user. 
- Route `/pages/view/:id`  : web page that contains a single page that has been opened, used to view that page in detail. `:id`: Route param that identifies the id of the page to be viewed.
- Route `/pages/edit/:id`  : web page that contains a single page that has been opened, used to edit the page (if logged user with the rights or admin). `:id`: Route param that identifies the id of the page to edit.

## API Server

### PAGES API
- GET `/api/pages/frontoffice`
  - Description: Get only-published pages for the frontoffice visualization (no authentication required).

    Request body: _None_

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body: An array of objects, each describing a page.
    ```
    [{
        "id": 1,
        "userId": 1,
        "username": "Enrico",
        "title": "Pagina1",
        "creationDate": "2023-02-28",
        "publicationDate": "2023-02-28",
    },
    ...
    ]
    ``` 
- GET `/api/pages/backoffice`
  - Description: Get all the pages for the backoffice visualization (authentication required).

    Request body: _None_

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body: An array of objects, each describing a page.
    ```
    [{
        "id": 1,
        "userId": 1,
        "username": "Enrico",
        "title": "Pagina1",
        "creationDate": "2023-02-28",
        "publicationDate": "2023-02-28",
    },
    ...
    ]
    ``` 
- GET `/api/pages/frontoffice/<id>`
  - Description: Get a specific published-only page, identified by the id `<id>`, along with the associated blocks (no authentication required).

    Request body: _None_

    Response: `200 OK` (success) or `404 Not Found` (Page or Block Not Found) or `500 Internal Server Error` (generic error).

    Response body: An object describing a page, with an array of objects, each describing a block.
    ```
    {
        "id": 1,
        "userId": 1,
        "username": "Enrico",
        "title": "Pagina1",
        "creationDate": "2023-02-28",
        "publicationDate": "2023-02-28",
        "blocks" : [{
            "id": 1,
            "pageId": 1,
            "type": "Header",
            "content": "Ciao Sono Domenico",
            "blockOrder": "1",
        },
        ...
        ]
    }
    ```
- GET `/api/pages/backoffice/<id>`
  - Description: Get a specific page, identified by the id `<id>`, along with the associated blocks (authentication required).

    Request body: _None_

    Response: `200 OK` (success) or `404 Not Found` (Page or Block Not Found) or `500 Internal Server Error` (generic error).

    Response body: An object describing a page, with an array of objects, each describing a block.
    ```
    {
        "id": 1,
        "userId": 1,
        "username": "Enrico",
        "title": "Pagina1",
        "creationDate": "2023-02-28",
        "publicationDate": "2023-02-28",
        "blocks" : [{
            "id": 1,
            "pageId": 1,
            "type": "Header",
            "content": "Ciao Sono Domenico",
            "blockOrder": "1",
        },
        ...
        ]
    }
    ```
- POST `/api/pages`
  - Description: Create a new Page, along with the associated blocks.

    Request body: An object representing a page and the associated blocks (Content-Type: `application/json`).
    ```
    {
        "userId": 1,
        "title": "Pagina1",
        "creationDate": "2023-02-28",
        "publicationDate": "2023-02-28",
        "blocks" : [{
            "type": "Header",
            "content": "Ciao Sono Domenico",
            "blockOrder": "1",
        },
        ...
        ]
    }
    ```

    Response: `201 Created` (success) or `503 Service Unavailable` (generic error, e.g., when trying to insert a page with non-existent userId). If the request body is not valid, `422 Unprocessable Entity` (validation error).

    Response body: An object representing the inserted page and the associated blocks, notably with the newly assigned id by the database (Content-Type: `application/json`).
    ```
    {
        "id": 1,
        "userId": 1,
        "title": "Pagina1",
        "creationDate": "2023-02-28",
        "publicationDate": "2023-02-28",
        "blocks" : [{
            "id": 1,
            "pageId": 1,
            "type": "Header",
            "content": "Ciao Sono Domenico",
            "blockOrder": "1",
        },
        ...
        ]
    }
    ```
- POST `/api/pages/<id>`
  - Description: Update a Page, identified by the id `<id>`, along with the associated blocks.

    Request body: An object representing a page and the associated blocks (Content-Type: `application/json`).
    ```
    {
      "id": 1,
      "userId": 1,
      "title": "pages1",
      "creationDate": "2023-02-28",
      "blocks": [
        {
          "pageId": 1,
          "type": "Header",
          "content": "Blog",
          "blockOrder": 1
        },
        {
          "pageId": 1,
          "type": "Paragraph",
          "content": "Ciao Sono Enrico",
          "blockOrder": 2
        }
      ]
    }
    ```

    Response: `200 OK` (success) or `503 Service Unavailable` (generic error). If the request body is not valid, `422 Unprocessable Entity` (validation error).

    Response body: An object representing the updated page (Content-Type: `application/json`).
    ```
    {
      "id": 1,
      "userId": 1,
      "title": "pages1",
      "creationDate": "2023-02-28",
      "publicationDate": null,
      "blocks": [
        {
          "id": 31,
          "pageId": 1,
          "type": "Header",
          "content": "Blog",
          "blockOrder": 1
        },
        {
          "id": 32,
          "pageId": 1,
          "type": "Paragraph",
          "content": "Ciao Sono Enrico",
          "blockOrder": 2
        }
      ]
    }
    ```
- DELETE `/api/pages/<id>`
  - Description: Delete a Page, identified by the id `<id>`.

    Request body: _None_

    Response: `204 No Content` (success) or `503 Service Unavailable` (generic error).

    Response body: _None_

  

### USERS API
- POST `/api/sessions`
  - Description: Create a new session starting from given credentials.

    Request body:
    ```
    {
      "username": "giorgio@gmail.com",
      "password": "pass"
    }
    ```

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body:
    ```
    {
      "id": 2,
      "username": "giorgio@gmail.com",
      "isAdmin": 0,
      "name": "Giorgio"
    }
    ```
- GET `/api/sessions/current`
  - Description: Verify if the given session is still valid and return the info about the logged-in user. A cookie with a VALID SESSION ID must be provided to get the info of the user authenticated in the current session.

    Request body: _None_ 

    Response: `201 Created` (success) or `401 Unauthorized` (error).

    Response body:
    ```
    {
      "id": 2,
      "username": "giorgio@gmail.com",
      "isAdmin": 0,
      "name": "Giorgio"
    }
    ```
- DELETE `/api/session/current`
  - Description: Delete the current session. A cookie with a VALID SESSION ID must be provided.

    Request body: _None_

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body: _None_
- GET `/api/authors`
  - Description: Get All The Authors of The Application (cambiare solo admin o aotenticato nel caso li faccio comparire solo in add/edit pagina)

    Request body: _None_ 

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body:
    ```
    [{
      "id": 2,
      "username": "Giorgio"
    },
    ...
    ]
    ```

### WEBSITE API
- GET `/api/websites`
  - Description: Get the website name.

    Request body: _None_

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body: An object, describing the website name.
    ```
    {
        "name": "CMSMALL",
    }
    ``` 
- PUT `/api/websites/<name>`
  - Description: Update the website name, with the new `<name>`.

    Request body: _None_

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body: An object, describing the website name.
    ```
    {
        "name": "NEWNAME",
    }
    ``` 
### IMAGES API
- GET `/api/images`
  - Description: Get all the images relative path.

    Request body: _None_

    Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

    Response body: An array with each element describing the image file name.
    ```
    [
      "image1.jpg",
      "image2.jpg",
      ...
    ]
    ``` 
## Database Tables

- Table `pages` that contains:
  - `id`: primary key of the page
  - `userId`: id that idetifies the user who owns the page
  - `title`: title of the page
  - `creationDate`: creation date of the page
  - `publicationDate`: publication date of the page (optional)
- Table `blocks` that contains:
  - `id`: primary key of the block
  - `pageId`: id that idetifies the page who owns the block
  - `type`: type of the block (Header,Paragraph,Image)
  - `content`: content of the block
  - `blockOrder`: blockOrder of the block inside the page 
- Table `users` that contains:
  - `id`: primary key of the user
  - `isAdmin`: flag that tells if the user is an Admin or not
  - `email`: email of the user
  - `username`: name of the user
  - `hash`: hashed password of the user 
  - `salt`: salt of the user, used for unique hashing 
- Table `website` that contains:
  - `name`: name of the website, editable by an Admin

## Main React Components

- `NavBar` (in `components/Navbar.jsx`): navbar component used to display the website name, along with eventual change name button and user information
- `ListOfPages` (in `components/PageList.jsx`): component used to display the list of all pages (published in frontoffice, all in backoffice)
- `PageElement` (in `components/PageList.jsx`): component used to display the single page in the list of all pages (published in frontoffice, all in backoffice)
- `AddButton` (in `components/PageList.jsx`): button to add a new page (in the backoffice)
- `LoginForm` (in `components/AuthComponents.jsx`): component used to display the login form, necessary to do the login
- `PageComponent` (in `components/PageComponent.jsx`): component used to display the single page in detail
- `PageContent` (in `components/PageContent.jsx`): component used to display all the blocks inside a page, when viewing the page in detail
- `Header` (in `components/Blocks.jsx`): component used to display blocks of type Header, inside the PageContent
- `Paragraph` (in `components/Blocks.jsx`): component used to display blocks of type Paragraph, inside the PageContent
- `Image` (in `components/Blocks.jsx`): component used to display blocks of type Image, inside the PageContent
- `BlockForm` (in `BlockManagement.jsx`): component used to add new block of various types and select new image when editing a `Image` type block.

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- enrico@gmail.com, pass (user author of two pages)
- giorgio@gmail.com, pass (user who has never created a page)
- admin@gmail.com, pass (user with admin privileges)
- domenico@gmail.com, pass (plus any other requested info) ???

