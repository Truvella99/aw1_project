import { useState, useContext, createContext, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Alert, Dropdown } from 'react-bootstrap'
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { UserContext, HandleErrorContext, render_componentsContext, SetDirtyContext, imagesBlockContext } from './Contexts';
import { PageContent } from './PageContent';
import { LoadingSpinner } from './Loading';
import API from '../API';
import dayjs from 'dayjs';

// component used to view a page in detail, edit a page and add a new page 
function PageComponent(props) {
  // id of the page to be fetched
  const pageId = useParams().id;
  // state used to store the page informations
  const [page, setPage] = useState({ id: undefined, userId: undefined, username: undefined, title: undefined, creationDate: undefined, publicationDate: undefined });
  // state used to store all the blocks of the page to be fetched
  const [blockList, setBlockList] = useState([]);
  // navigate to go to a certain url
  const navigate = useNavigate();
  // handleError context retrieved with useContext hook
  const handleError = useContext(HandleErrorContext);
  // user context retrieved with useContext hook
  const user = useContext(UserContext);
  // setDirty context retrieved with useContext hook
  const setDirty = useContext(SetDirtyContext);
  // isAdmin attribute of the user
  const isAdmin = user.isAdmin;
  // various users ({id,name}) of the application, loaded if there are admin permissions
  // used to allow the admin to select a different author (among the existing users) for the page
  const [users, setUsers] = useState([]);
  // function to get from the server the current website name, passed as a prop
  const getWebsiteName = props.getWebsiteName;
  // state user to store all the images available in the application
  const [images, setImages] = useState([]);
  // states of the form, used to edit page informations (controlled form) 
  const [title, setTitle] = useState('');
  // author state: used for updating the interface accordingly and to set the page object when
  // adding/editing a page
  const [author, setAuthor] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  // initialLoading state: handle the first resource loading by showing a loading spinner
  const [initialLoading,setInitialLoading] = useState(true);
 
  // props used to tell from which url i am mounting this component
  const location = props.location;
  // condition to render components and make them editable
  // then passed as a context to conditional render also the single blocks, by making them editable or not
  let render_components;

  if (location === 'add') {
    // if user is not logged in, not render add/edit logic and make form components not editable
    // render_components = false
    // otherwise render add logic and make form components editable
    // render_components = true
    render_components = user.id !== undefined;
  } else if (location === 'view') {
    // not render the add/edit logic and make form components not editable a priori since we want to view only
    // render_components = false
    render_components = false;
  } else {
    // edit path
    // if user is logged in, owns the page that he wants to edit or he's an Admin, render add/edit logic and make form components editable 
    // render_components = true
    // otherwise make form components not editable
    // render_components = false
    render_components = (user.id === page.userId) || user.isAdmin;
  }

  // useeffect, executed only when the component is mounted, used to retrieve the informations of the specific page
  useEffect(() => {
    // function used to retrieve page information in detail
    async function getPage(pageId) {
      try {
        let page;
        if (user.id) {
          // logged user, retrieve also backoffice pages
          page = await API.getPagesbyIdBackOffice(pageId);
        } else {
          // only visulization, retrieve frontoffice pages only
          page = await API.getPagesbyIdFrontOffice(pageId);
        }
        // once obtained the page from the server, set react sttes accordingly
        setPage({ id: page.id, userId: page.userId, username: page.username, title: page.title, creationDate: page.creationDate, publicationDate: page.publicationDate });
        setTitle(page.title);
        setAuthor(page.username);
        setCreationDate(page.creationDate);
        setPublicationDate(page.publicationDate);
        setBlockList(page.blocks);
      } catch (err) {
        // show error message
        handleError(err);
      }
    };
    // function used to retrieve all the users of the application, if Admin
    // used to allow the admin to select a different author (among the existing users) for the page
    async function getUsers() {
      try {
        const users = await API.getUsers();
        setUsers(users);
      } catch (err) {
        handleError(err);
      }
    }
    // function used to retrieve all the images, then used for let user choice among them
    async function retrieveAllImages() {
      try {
        const images = await API.getAllImages();
        setImages(images);
      } catch (err) {
        handleError(err);
      }
    }

    if (pageId) {
      // edit/view page case, since there is an id in the url
      getPage(pageId);
    } else {
      // no id in the url, add page case
      // set creation date to today and author to the current logged in user
      setCreationDate(dayjs().format("YYYY-MM-DD"));
      setAuthor(user.username);
    }
    // getting the users only if admin
    if (isAdmin) {
      getUsers();
    }
    // get the website name and all the available images a priori 
    getWebsiteName();
    retrieveAllImages();
    // disable the spinner after retrieving all the data
    setInitialLoading(false);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      // FORM VALIDATION:
      // ONLY client checks needed:
      // - check that there is at least one header blocks and another block
      // - check that all blocks content is not empty  
      // - check that the title is not space-only
      // empty title is not possible since there is required attribute
      // publication date before creation is not possible since min attribute of input type date
      // blocks with sameorder is not possible since the array index is taken
      // image with misleading content is not possible since it is not text editable
      if (title.length === 0) {
        handleError({ error: 'Title must not have only spaces. Please Insert a Valid Title.' });
      } else if (blockList.length < 2 || blockList.every((block) => block.type !== 'Header')) {
        handleError({ error: 'A Page must have at least 1 block of type Header and another block' });
      } else if (blockList.some((block) => block.content.trim() === '')) {
        handleError({ error: 'All blocks must not be empty.' });
      } else {
        // construct new page object to create/update
        if (pageId) {
          // edit/view page case, since there is an id in the url
          // create the object properly and call the update page API
          // here username: author since , if user with Admin privileges
          // the actual author (that was maybe changed) is stored in the author state  
          const send_page = { id: pageId, userId: page.userId || user.id, username: author, title: title, creationDate: creationDate, publicationDate: publicationDate ? publicationDate : undefined };
          send_page.blocks = blockList.map((block, index) => {
            return {
              type: block.type,
              content: block.content.trim(),
              blockOrder: index + 1
            };
          });
          await API.updatePage(send_page, pageId);
        } else {
          // no id in the url, add page case
          // create the object properly and call the create page API
          // here username: author since , if user with Admin privileges
          // the actual author (that was maybe changed) is stored in the author state  
          const send_page = { id: undefined, userId: page.userId || user.id, username: author, title: title, creationDate: creationDate, publicationDate: publicationDate ? publicationDate : undefined };
          send_page.blocks = blockList.map((block, index) => {
            return {
              type: block.type,
              content: block.content.trim(),
              blockOrder: index + 1
            };
          });
          await API.createPage(send_page);
        }
        // rehydrate the data and go to backoffice
        setDirty(true);
        navigate('/backoffice');
      }
    } catch (err) {
      // display error message
      handleError(err);
    }
  };

  return (
    <Container fluid>
      {initialLoading && <LoadingSpinner/>}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="3">
            <Form.Label>Page Title</Form.Label>
            <Form.Control
              required
              readOnly={!render_components}
              type="text"
              placeholder="Insert Page Title Here"
              onChange={event => setTitle(event.target.value.trim())}
              defaultValue={title}
            />
          </Form.Group>
          <Form.Group as={Col} md="3">
            <Form.Label>Page Author</Form.Label>
            { // display the choose user menu if I am an authenticated user (render_components)
              //but also with admin privileges (isAdmin). Otherwise a normal user in add would see the menu
              isAdmin && render_components ?
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {author}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {users.map((author, index) => {
                      // onClick: change the author of the current page
                      // author state: used for updating the interface accordingly and to set the page object when
                      // adding/editing a page
                      return <Dropdown.Item key={index} onClick={() => { setPage(Object.assign({}, page, { userId: author.id }, { username: author.username })); setAuthor(author.username); }}>{author.username}</Dropdown.Item>;
                    })}
                  </Dropdown.Menu>
                </Dropdown>
                : <Form.Control required readOnly={true} type="text" defaultValue={author} />}
          </Form.Group>
          <Form.Group as={Col} md="3">
            <Form.Label>Page Creation Date</Form.Label>
            <Form.Control type="date" readOnly defaultValue={creationDate} />
          </Form.Group>
          <Form.Group as={Col} md="3">
            <Form.Label>Page Publication Date</Form.Label>
            <Form.Control type="date" readOnly={!render_components} min={creationDate} onChange={event => setPublicationDate(event.target.value)} defaultValue={publicationDate} />
          </Form.Group>
        </Row>
        <Row>
          {/* Pass the render_components flag ang images array to pageContent component */}
          <render_componentsContext.Provider value={render_components}>
            <imagesBlockContext.Provider value={images}>
              <PageContent blockList={blockList} setBlockList={setBlockList} />
            </imagesBlockContext.Provider>
          </render_componentsContext.Provider>
        </Row>
        { // render Submit/Close form button in add/edit, otherwise only close button in view is rendered.
        render_components ?
          <Container className='buttons'>
            <Button type="submit">Submit form</Button>{' '}
            <Link to={'/backoffice'}><Button variant="warning" onClick={() => {setDirty(true)}}>Close Form</Button></Link>
          </Container> :
          <Container className='buttons'>
            <Link to={user.id ? '/backoffice' : '/'}><Button variant="warning" onClick={() => {setDirty(true)}}>Close</Button></Link>
          </Container>}
      </Form>
    </Container>
  );
}

export { PageComponent };