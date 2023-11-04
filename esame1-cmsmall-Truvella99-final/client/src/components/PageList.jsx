import { Table, Button, Dropdown, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext, SetDirtyContext } from './Contexts';
import dayjs from 'dayjs';
import { headings } from './Costants';

// Cmoponent used to display the list of the pages of the application, along with their properties
function ListOfPages(props) {
  // user state shared with useContext hook
  const user = useContext(UserContext);
  // list of pages to display, passed as a prop from app
  let pageList = props.pageList;
  // props for filter only by published pages (true = front office) or not filter (false = backoffice)
  const front_office = props.front_office;
  // props to delete a page (when clicking on the delete icon)
  const deletePage = props.deletePage;

  if (front_office===true && user.id) {
    // if an user is authenticated (user.id is defined) and wants to see the frontoffice (front_office=true)
    // filter and obtain only publicated pages
    // if not authenticated don't filter since the frontoffice api will be called directly
    pageList = pageList.filter((page) => {
      const today = dayjs();
      const publicationDate = dayjs(page.publicationDate);
      if (publicationDate.isBefore(today, 'day') || publicationDate.isSame(today, 'day')) {
        return true;
      }
      return false;
    });
  }

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            { //map the table headings
            headings.map((heading, index) => {
              return <th key={index}>{heading}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {pageList.map((page) => {
            // map each Page using the pagelist. Each Page is created with a separate component
            return <PageElement front_office={front_office} key={page.id} page={page} deletePage={deletePage} />
          })}
        </tbody>
      </Table>
      {/*Show the button to navigate through front and back office only if authenticated*/}
      {user.id ? <Container className='buttons'><ChangeButton front_office={front_office} /><AddButton /></Container> : ''}
    </>
  );
}

// component used to display a single page row in the pagelist table
function PageElement(props) {
  // current logged in user, passed through usecontext
  const user = useContext(UserContext);
  // setDirty state shared with useContext hook
  const setDirty = useContext(SetDirtyContext);
  // isAdmin property of the user
  const isAdmin = user.isAdmin;
  // single page element, passed as a props and used to populate the component
  const page = props.page;
  // props for display delete and edit buttons (false = front office) or not (true = backoffice)
  const front_office = props.front_office;

  // function to delete a Page
  function deletePage() {
    // rehydrate data
    setDirty(true);
    // call the deletepage api, passed as a prop
    props.deletePage(page.id);
  }

  // condition on which display delete and edit buttons
  const condition = (user.id === page.userId || isAdmin) && !front_office;

  return (
    <tr key={page.id}>
      <td>
        {condition ? <Link className='icons'><i className="bi bi-trash-fill" onClick={() => deletePage()} /></Link> : ''}
        
        {'\t'  /* no setDirty here, useless to retrieve all page list for get fresh website name, recall it directly in pageComponent*/}
        {condition ? <Link className='icons' to={`/pages/edit/${page.id}`}><i className="bi bi-pencil-fill" /></Link> : ''}
        {'\t'  /* no setDirty here, useless to retrieve all page list for get fresh website name, recall it directly in pageComponent*/}
        <Link className='icons' to={`/pages/view/${page.id}`}><i className="bi bi-eye-fill" /></Link>
      </td>
      <td>{page.username}</td>
      <td>{page.title}</td>
      <td>{page.creationDate}</td>
      <td>{page.publicationDate}</td>
    </tr>
  );
}

function ChangeButton(props) {
  // navigate to change office type
  const navigate = useNavigate();
  // setDirty state shared with useContext hook
  const setDirty = useContext(SetDirtyContext);
  // front_office: used to undestand the url to move to
  const front_office = props.front_office;
  // content: used to compose the button test 
  const content = (front_office ? 'Back Office' : 'Front Office');
  // function to change office
  const change_office = () => {
    const url = (front_office ? '/backoffice' : '/');
    // navigate to the url
    navigate(`${url}`);
    // rehydrate data
    setDirty(true);
  };

  return (
    <Button className='my-2 mx-2' variant='success' onClick={() => change_office()}>Go To {content}</Button>
  );
}

function AddButton(props) {
  // no setDirty here, useless to retrieve all page list for get fresh website name, recall it directly in pageComponent

  return (
    <Link to="/pages/add"><Button className='AddButton'>+</Button></Link>
  );
}

export { ListOfPages };