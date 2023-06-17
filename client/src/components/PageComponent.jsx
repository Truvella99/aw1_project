import { useState, useContext, createContext, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Alert, Dropdown } from 'react-bootstrap'
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { UserContext, HandleErrorContext, render_componentsContext, SetDirtyContext, imagesBlockContext } from './Contexts';
import { PageContent } from './PageContent';
import { BlockForm } from './BlockManagement';
import API from '../API';
import dayjs from 'dayjs';


function PageComponent(props) {
  // id of the page to be fetched
  const pageId = useParams().id;
  // page informations
  const [page, setPage] = useState({ id: undefined, userId: undefined, username: undefined, title: undefined, creationDate: undefined, publicationDate: undefined });
  // blocks informations of that page to be fetched
  const [blockList, setBlockList] = useState([]);
  // navigate to go to the url
  const navigate = useNavigate();
  // error handling context
  const handleError = useContext(HandleErrorContext);
  // user context
  const user = useContext(UserContext);
  // setdirty context
  const setDirty = useContext(SetDirtyContext);
  // isAdmin attribute of the user
  const isAdmin = user.isAdmin;
  // various authors ({id,name}) of the application, loaded if there are admin permissions
  const [authors, setAuthors] = useState([]);
  // state to mantain all the images available
  const [images, setImages] = useState([]);
  // state of the validation of the form
  const [validated, setValidated] = useState(false);
  // states of the page (controlled form)
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [publicationDate, setPublicationDate] = useState('');

  /*const current_filter = useLocation().state;*/
  // props to tell where in which url i am mounting this component
  const location = props.location;
  // condition to render components and make them editable
  let render_components;
  // condition to make page form components not editable 
  let make_not_editable;

  if (location === 'add') {
    // if user is not logged in, not render add/edit logic and make form components not editable
    // render_components = false
    // make_not_editable = true
    // otherwise render add logic and make form components editable
    // render_components = true
    // make_not_editable = false
    render_components = user.id !== undefined;
    make_not_editable = !render_components;
  } else if (location === 'view') {
    // not render the add/edit logic and make form components not editable a priori since we want to view only
    // render_components = false
    // make_not_editable = true
    render_components = false;
    make_not_editable = !render_components;
  } else {
    // edit path
    // if user is logged in, owns the page that he wants to edit or he's an Admin, render add/edit logic and make form components editable 
    // render_components = true
    // make_not_editable = false
    // otherwise render add logic and make form components not editable
    // render_components = false
    // make_not_editable = true
    render_components = (user.id === page.userId) || user.isAdmin;
    make_not_editable = !render_components;
  }

  // useeffect, executed only when the component is mounted, used to retrieve the informations of the specific page
  useEffect(() => {
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
        setPage({ id: page.id, userId: page.userId, username: page.username, title: page.title, creationDate: page.creationDate, publicationDate: page.publicationDate });
        setTitle(page.title);
        setAuthor(page.username);
        setCreationDate(page.creationDate);
        setPublicationDate(page.publicationDate);
        setBlockList(page.blocks);
      } catch (err) {
        handleError(err);
      }
    };
    async function getAuthors() {
      try {
        const authors = await API.getAuthors();
        setAuthors(authors);
      } catch (err) {
        handleError(err);
      }
    }
    // call the API to display the images for choice
    async function retrieveAllImages() {
      try {
        const images = await API.getAllImages();
        setImages(images);
      } catch (err) {
        handleError(err);
      }
    }

    if (pageId) {
      getPage(pageId);
    } else {
      setCreationDate(dayjs().format("YYYY-MM-DD"));
      setAuthor(user.username);
    }
    if (isAdmin) {
      getAuthors();
    }
    retrieveAllImages();
  }, []);

  async function handleSubmit(event)  {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === true) {
      try {
        // FORM VALIDATION:
        // ONLY client check needed: check that there is at least one header blocks and another block
        // publication date before creation is not possible since min attrbiute of input type date
        // blocks with sameorder is not possible since i take the array index
        // image with misleading content is not possible since it is not text editable
        if (blockList.length < 2 || blockList.every((block) => block.type !== 'Header')) {
          handleError({ error: 'A Page must have at least 1 block of type Header and another block' });
        } else if(blockList.some((block) => block.content === '')) { 
          handleError({ error: 'All blocks must not be empty.' });
        } else {
          // construct new page object to create/update
          if (pageId) {
            // update page API
            const send_page = { id: pageId, userId: page.userId || user.id, username: author, title: title, creationDate: creationDate, publicationDate: publicationDate ? publicationDate : undefined };
            send_page.blocks = blockList.map((block, index) => {
              return {
                pageId: block.pageId,
                type: block.type,
                content: block.content,
                blockOrder: index + 1
              };
            });
            await API.updatePage(send_page, pageId);
          } else {
            // create new page API
            const send_page = { id: undefined, userId: page.userId || user.id, username: author, title: title, creationDate: creationDate, publicationDate: publicationDate ? publicationDate : undefined };
            send_page.blocks = blockList.map((block, index) => {
              return {
                pageId: block.pageId,
                type: block.type,
                content: block.content,
                blockOrder: index + 1
              };
            });
            await API.createPage(send_page);
          }
          setDirty(true);
          navigate('/backoffice');
        }
      } catch (err) {
        handleError(err);
      }
    }
    setValidated(true);
  };

  return (
    <Container fluid>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="3" controlId="validationCustom01">
            <Form.Label>Page Title</Form.Label>
            <Form.Control
              required
              readOnly={make_not_editable}
              type="text"
              placeholder="Insert Page Title Here"
              onChange={event => setTitle(event.target.value)}
              defaultValue={title}
            />
            <Form.Control.Feedback type='invalid'>Please Insert a Title.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="3">
            <Form.Label>Page Author</Form.Label>
            { // not only render_components otherwise a normal user in add would see the menu
              isAdmin && render_components ?
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {author}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {authors.map((author, index) => {
                      // onClick we change the author of the current page
                      // author state for interfaces and 
                      return <Dropdown.Item key={index} onClick={() => { setPage(Object.assign({}, page, { userId: author.id }, { username: author.username })); setAuthor(author.username); }}>{author.username}</Dropdown.Item>;
                    })}
                  </Dropdown.Menu>
                </Dropdown>
                : <Form.Control required readOnly={true} type="text" defaultValue={author} />}
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="validationCustom02">
            <Form.Label>Page Creation Date</Form.Label>
            <Form.Control type="date" readOnly defaultValue={creationDate} />
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="validationCustom02">
            <Form.Label>Page Publication Date</Form.Label>
            <Form.Control type="date" readOnly={make_not_editable} min={creationDate} onChange={event => setPublicationDate(event.target.value)} defaultValue={publicationDate} />
            <Form.Control.Feedback type='invalid'>Please Insert a Valid Date.</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row>
          <render_componentsContext.Provider value={render_components}>
            <imagesBlockContext.Provider value={images}>
              <PageContent blockList={blockList} setBlockList={setBlockList} />
            </imagesBlockContext.Provider>
          </render_componentsContext.Provider>
        </Row>
        {render_components ?
          <Container className='buttons'>
            <Button type="submit">Submit form</Button>{' '}
            <Link to={'/backoffice'}><Button variant="warning" /*onClick={() => {props.setEditFilm(undefined)}}*/>Close Form</Button></Link>
          </Container> :
          <Container className='buttons'>
            <Link to={user.id ? '/backoffice' : '/'}><Button variant="warning">Close</Button></Link>
          </Container>}
      </Form>
    </Container>
  );
}

export { PageComponent };