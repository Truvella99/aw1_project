import { Table,Button } from 'react-bootstrap';
import { Link,useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../App';
import dayjs from 'dayjs';

// heading array to map the table headings easily
const headings = ["","Author","Title","Creation Date","Publication Date"];

function ListOfPages(props) {
  // user state shared with useContext hook
  const user = useContext(UserContext);
  // list of pages to display
  let pageList = props.pageList;
  // props for filter only by published pages (true = front office) or not filter (false = backoffice)
  const front_office = props.front_office;
  // props for the bottom button in order to move across the offices
  const ChangeOffice = props.ChangeOffice;
  // props to delete a page
  const deletePage = props.deletePage;

  if (front_office) {
    // filter and obtain only publicated pages
    pageList = pageList.filter((page) => {
        const today = dayjs();
        if (page.publicationDate.isBefore(today,'day') || page.publicationDate.isSame(today,'day')) {
            return true;
        }
        return false;
    });
  } else if (!user.id) {
    // if not authenticated, avoid to show the list in case you edit the url
    pageList = [];
  }
  
  return (
    <>
    <Table striped bordered hover>
      <thead>
        <tr>
          {headings.map((heading,index) => {
            return <th key={index}>{heading}</th>
          })}
        </tr>
      </thead>
      <tbody>
        {pageList.map((page) => {
            return <PageElement key={page.id} page={page} deletePage={deletePage}/>
        })}
      </tbody>
    </Table>
    {/*Show the button only if authenticated*/}
    {user.id ? <><ChangeButton ChangeOffice={ChangeOffice}/><AddButton/></> : ''}
    </>
  );
}

function PageElement(props) {
  // current logged in user, passed through usecontext
  const user = useContext(UserContext);
  // single page element, used to populate the component
  const page = props.page;
  // function to delete a Page
  function deletePage() {
    props.deletePage(page.id);
  }
  return (
    <tr key={page.id}>
      <td>
        {(user.id === page.userId || user.isAdmin) ? <i className="bi bi-trash-fill" onClick={() => deletePage()} /> : ''}
        {'\t'}
        {(user.id === page.userId || user.isAdmin) ? <Link to={`/pages/edit/${page.id}`}><i className="bi bi-pencil-fill" /></Link> : ''}
        {'\t'}
        <Link to={`/pages/view/${page.id}`}><i className="bi bi-eye-fill" /></Link>
      </td>
      <td>{page.username}</td>
      <td>{page.title}</td>
      <td>{page.creationDate.format("YYYY-MM-DD")}</td>
      <td>{(page.publicationDate.format("YYYY-MM-DD") === 'Invalid Date') ? '' : page.publicationDate.format("YYYY-MM-DD")}</td>
    </tr>
  );
}

function ChangeButton(props) {
  // props.ChangeOffice: url to move to
  // navigate to return to props.ChangeOffice
  const navigate = useNavigate();
  // content: compose the button test 
  const content = (props.ChangeOffice.includes('backoffice') ? 'Back Office' : 'Front Office');
  return (
    <Button className='my-2 mx-2' variant='success' onClick={()=>navigate(`${props.ChangeOffice}`)}>Go To {content}</Button>
  );
}

function AddButton(props) {
  return (
    <Link to="/pages/add"><Button className='AddButton'>+</Button></Link>
  );
}

export {ListOfPages};