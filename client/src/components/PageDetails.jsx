import { useState, useContext, createContext, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Alert, Dropdown } from 'react-bootstrap'
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { HandleErrorContext, UserContext } from '../App';
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
  // isAdmin attribute of the user
  const isAdmin = user.isAdmin;
  // various authors ({id,name}) of the application, loaded if there are admin permissions
  const [authors,setAuthors] = useState([]);
  // state of the validation of the form
  const [validated, setValidated] = useState(false);
  // states of the page (controlled form)
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [publicationDate, setPublicationDate] = useState('');

  /*const current_filter = useLocation().state;*/

  // useeffect, executed only when the component is mounted, used to retrieve the informations of the specific page
  useEffect(() => {
    async function getPage(pageId) {
      try {
        const page = await API.getPagesbyId(pageId);
        setPage({ id: page.id, userId: page.userId, username: page.username, title: page.title, creationDate: page.creationDate, publicationDate: page.publicationDate });
        setTitle(page.title);
        setAuthor(page.username);
        setCreationDate(page.creationDate.format("YYYY-MM-DD"));
        setPublicationDate((page.publicationDate && page.publicationDate.format("YYYY-MM-DD") !== "Invalid Date") ? page.publicationDate.format("YYYY-MM-DD") : '');
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
    if (pageId) {
      getPage(pageId);
    }
    if (pageId && isAdmin) {
      getAuthors();
    }
  }, []);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    // FORM VALIDATION
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
              type="text"
              placeholder="Insert Page Title Here"
              onChange={event => setTitle(event.target.value)}
              defaultValue={title}
            />
          </Form.Group>
          <Form.Group as={Col} md="3">
            <Form.Label>Page Author</Form.Label>
            {isAdmin ?
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {author}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {authors.map((author,index) => {
                    // onClick we change the author of the current page
                    // author state for interfaces and 
                    return <Dropdown.Item key={index} onClick={() => { setPage(Object.assign({},page,{userId: author.id},{username: author.username})); setAuthor(author.username); }}>{author.username}</Dropdown.Item>;
                  })}
                </Dropdown.Menu>
              </Dropdown>
              : <Form.Control required readOnly type="text" defaultValue={author} />}
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="validationCustom02">
            <Form.Label>Page Creation Date</Form.Label>
            <Form.Control type="date" readOnly defaultValue={creationDate} />
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="validationCustom02">
            <Form.Label>Page Publication Date</Form.Label>
            <Form.Control type="date" min={creationDate} onChange={event => setPublicationDate(event.target.value)} defaultValue={publicationDate} />
          </Form.Group>
        </Row>
      </Form>
      <Row>
        <Col md={7} className='blockListPageForm'>
          { user.id ? <h2 style={{ textAlign: 'center' }}>Drag and Drop Items to Rearrange Them</h2> : ''}
          <PageContent blockList={blockList} setBlockList={setBlockList} />
        </Col>
        <Col md={5}>
          <h1>wdverre</h1>
        </Col>
      </Row>
      { user.id ? 
      <Container className='buttonsPageForm'>
        <Button type="submit">Submit form</Button>{' '}
        <Link to={`/${(user.id) ? 'backoffice' : ''}`}><Button variant="warning" /*onClick={() => {props.setEditFilm(undefined)}}*/>Close Form</Button></Link>
      </Container> : 
      <Container className='buttonsPageForm'>
        <Link to={'/'}><Button variant="success">Close</Button></Link>
      </Container>}
    </Container>
  );
}

/***    BLOCK MANAGEMENT LOGIC    ***/

// onDragStart shared context
const onDragStartContext = createContext(null);
// onDragEnd shared context
const onDragEnterContext = createContext(null);
// handleSort shared context
const handleSortContext = createContext(null);
// handleSort shared context
const removeBlockContext = createContext(null);
// handleSort shared context
const saveBlockContext = createContext(null);

function Header(props) {
  // block object fo this block and current index in the block array 
  const { block, index } = props;
  // set the content editable
  const [editable, setEditable] = useState(false);
  // onDragStart shared with useContext hook
  const onDragStart = useContext(onDragStartContext);
  // onDragEnter shared with useContext hook
  const onDragEnter = useContext(onDragEnterContext);
  // onDragStart shared with useContext hook
  const handleSort = useContext(handleSortContext);
  // onDragStart shared with useContext hook
  const removeBlock = useContext(removeBlockContext);
  // onDragStart shared with useContext hook
  const saveBlock = useContext(saveBlockContext);
  // user context
  const user = useContext(UserContext);
  // state for the current value of block content during the editing
  const [blockContent,setBlockContent] = useState(block.content);

  // function that handle the procedure to save the block
  function save() {
    setEditable(false);
    block.content = blockContent;
    saveBlock(block);
  }

  if (user.id) {
    return (
      <Row
        draggable
        onDragStart={(event) => onDragStart(event, index)}
        onDragEnter={(event) => onDragEnter(event, index)}
        onDragEnd={(event) => { handleSort(event) }}
        style={{ border: '2px solid red' }}>
        <Col md={2} className='icons'>
          <i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i>
          {'  '}
          <i className="bi bi-pencil-fill" onClick={() => setEditable(true)}></i>
          {'  '}
          <i className="bi bi-device-hdd-fill" onClick={() => save() }></i>
        </Col>
        <Col md={4}>
          <h3 style={editable ? {backgroundColor: 'powderblue'}:{}} contentEditable={editable} suppressContentEditableWarning={true} onInput={(event) => { setBlockContent(event.target.textContent) }}>
            {block.content}
          </h3>
        </Col>
      </Row>
    );
  } else {
    return <h3 style={{ textAlign: 'center' }}>{block.content}</h3>;
  }
}

function Paragraph(props) {
  // block object fo this block and current index in the block array 
  const { block, index } = props;
  // set the content editable
  const [editable, setEditable] = useState(false);
  // onDragStart shared with useContext hook
  const onDragStart = useContext(onDragStartContext);
  // onDragEnter shared with useContext hook
  const onDragEnter = useContext(onDragEnterContext);
  // onDragStart shared with useContext hook
  const handleSort = useContext(handleSortContext);
  // onDragStart shared with useContext hook
  const removeBlock = useContext(removeBlockContext);
  // onDragStart shared with useContext hook
  const saveBlock = useContext(saveBlockContext);
  // user context
  const user = useContext(UserContext);
  // state for the current value of block content during the editing
  const [blockContent,setBlockContent] = useState(block.content);

  // function that handle the procedure to save the block
  function save() {
    setEditable(false);
    block.content = blockContent;
    saveBlock(block);
  }

  if (user.id) {
    return (
      <Row
        draggable
        onDragStart={(event) => onDragStart(event, index)}
        onDragEnter={(event) => onDragEnter(event, index)}
        onDragEnd={(event) => { handleSort(event) }}
        style={{ border: '2px solid red' }}>
        <Col md={2} className='icons'>
          <i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i>
          {'  '}
          <i className="bi bi-pencil-fill" onClick={() => setEditable(true)}></i>
          {'  '}
          <i className="bi bi-device-hdd-fill" onClick={() => save() }></i>
        </Col>
        <Col md={4}>
          <p style={editable ? {backgroundColor: 'powderblue'}:{}} contentEditable={editable} suppressContentEditableWarning={true} onInput={(event) => { setBlockContent(event.target.textContent) }}>
            {block.content}
          </p>
        </Col>
      </Row>
    );
  } else {
    return <p>{block.content}</p>;
  }
  
}


function Image(props) {
  // block object fo this block and current index in the block array 
  const { block, index } = props;
  // set the content editable
  const [editable, setEditable] = useState(false);
  // onDragStart shared with useContext hook
  const onDragStart = useContext(onDragStartContext);
  // onDragEnter shared with useContext hook
  const onDragEnter = useContext(onDragEnterContext);
  // onDragStart shared with useContext hook
  const handleSort = useContext(handleSortContext);
  // onDragStart shared with useContext hook
  const removeBlock = useContext(removeBlockContext);
  // onDragStart shared with useContext hook
  const saveBlock = useContext(saveBlockContext);
  // user context
  const user = useContext(UserContext);

  if (user.id) {
    return (
      <Row
        draggable
        onDragStart={(event) => onDragStart(event, index)}
        onDragEnter={(event) => onDragEnter(event, index)}
        onDragEnd={(event) => { handleSort(event) }}
        style={{ border: '2px solid red' }}>
        <Col md={2} className='icons'>
          <i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i>
          {'  '}
          <i className="bi bi-pencil-fill" onClick={() => setEditable(true)}></i>
          {'  '}
          <i className="bi bi-device-hdd-fill" onClick={() => { setEditable(false); saveBlock(block) }}></i>
        </Col>
        <Col md={4}>
          <img src={IMAGE_PATH + `${block.content}`} width={400} height={300}/>
        </Col>
      </Row>
    );
  } else {
    return <img src={IMAGE_PATH + `${block.content}`} width={400} height={300}/>;
  }
}

const IMAGE_PATH = 'http://localhost:3001/images/';

function PageContent(props) {
  // list of blocks and relative set function to manage block movement
  const { blockList, setBlockList } = props;
  // state to save source item index (the element on which the drag starts)
  const [sourceIndex, setSourceIndex] = useState(undefined);
  // state to save destination item index (the element on which the source element is dropped)
  const [destinationIndex, setDestinationIndex] = useState(undefined);

  // function to add a block from the blocklist
  function addBlock(block) {
    setBlockList((oldBlockList) => [...oldBlockList, block]);
  }

  // function to remove a block from the blockList
  function removeBlock(deletedBlock) {
    setBlockList((blockList) => blockList.filter((block) => {
      if (block.id !== deletedBlock.id) {
        return true;
      } else {
        return false;
      }
    }
    ));
  }

  // function to save the current block edit into the blockList
  function saveBlock(updatedBlock) {
    setBlockList((blockList) => blockList.map((block) => {
      if (block.id === updatedBlock.id) {
        return Object.assign({}, block, { content: updatedBlock.content });
      } else {
        return block;
      }
    }
    ));
  }

  // function to handle the drag start
  function onDragStart(event, index) {
    // set the start item index
    setSourceIndex(index);
  }

  // function to handle the drag enter (su quale elemento andiamo col drag item su quali altri items)
  function onDragEnter(event, index) {
    // set the destination item index
    setDestinationIndex(index);
  }

  // function to handle the drag end, and so the reordering of the list (when we release the mouse)
  function handleSort(event) {
    // here we reorder the list
    let reordered_list = [...blockList];
    // remove the dragged item from the list
    const dragItem = reordered_list.splice(sourceIndex, 1)[0];
    // reinsert in the destination position in the array
    reordered_list.splice(destinationIndex, 0, dragItem);
    // update coherently the block order
    reordered_list = reordered_list.map((block, index) => {
      return Object.assign({}, block, { blockOrder: index + 1 });
    });
    // update the state and reset the indexes
    setBlockList(reordered_list);
    setSourceIndex(undefined);
    setDestinationIndex(undefined);
  }

  // each element has the draggable property to make it draggable
  return (
    <onDragStartContext.Provider value={onDragStart}>
      <onDragEnterContext.Provider value={onDragEnter}>
        <handleSortContext.Provider value={handleSort}>
          <removeBlockContext.Provider value={removeBlock}>
            <saveBlockContext.Provider value={saveBlock}>
              <Container style={{ overflow: 'auto', maxHeight: '600px' }}>
                {blockList.map((block, index) => {
                  switch (block.type) {
                    case "Header":
                      return <Header key={block.id} block={block} index={index} />;
                      break;
                    case "Paragraph":
                      return <Paragraph key={block.id} block={block} index={index} />;
                      break;
                    case "Image":
                      return <Image key={block.id} block={block} index={index} />;
                      break;
                    default:
                      break;
                  }
                })}
              </Container>
            </saveBlockContext.Provider>
          </removeBlockContext.Provider>
        </handleSortContext.Provider>
      </onDragEnterContext.Provider>
    </onDragStartContext.Provider>
  );
}

export { PageComponent };