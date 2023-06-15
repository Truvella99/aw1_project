import { Table,Button,Dropdown } from 'react-bootstrap';
import { Link,useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext,SetDirtyContext } from '../App';
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
    {user.id ? <><ChangeButton front_office={front_office}/><AddButton/></> : ''}
    </>
  );
}

function PageElement(props) {
  // current logged in user, passed through usecontext
  const user = useContext(UserContext);
  // navigate to view/edit the page
  const navigate = useNavigate();
  // setDirty state shared with useContext hook
  const setDirty = useContext(SetDirtyContext);
  // isAdmin property of the user
  const isAdmin = user.isAdmin;
  // single page element, used to populate the component
  const page = props.page;
  // function to delete a Page
  function deletePage() {
    props.deletePage(page.id);
  }
  
  return (
    <tr key={page.id}>
      <td>
        {(user.id === page.userId || user.isAdmin) ? <Link><i className="bi bi-trash-fill" onClick={() => deletePage()}/></Link> : ''}
        {'\t'}
        {(user.id === page.userId || user.isAdmin) ? <Link to={`/pages/edit/${page.id}`}><i className="bi bi-pencil-fill" onClick={() => {setDirty(true)}} /></Link> : ''}
        {'\t'}
        <Link to={`/pages/view/${page.id}`}><i className="bi bi-eye-fill" onClick={() => {setDirty(true)}}/></Link>
      </td>
      <td>{page.username}</td>
      <td>{page.title}</td>
      <td>{page.creationDate.format("YYYY-MM-DD")}</td>
      <td>{(page.publicationDate.format("YYYY-MM-DD") === 'Invalid Date') ? '' : page.publicationDate.format("YYYY-MM-DD")}</td>
    </tr>
  );
}

function ChangeButton(props) {
  // navigate to return to props.front_office
  const navigate = useNavigate();
  // setDirty state shared with useContext hook
  const setDirty = useContext(SetDirtyContext);
  // props.front_office: use to undestand the url to move to
  const front_office = props.front_office;
  // content: compose the button test 
  const content = (front_office ? 'Back Office' : 'Front Office');
  // function to change office
  const change_office = () => {
    const url = (front_office ? '/backoffice' : '/');
    navigate(`${url}`);
    // refresh data
    setDirty(true);
  };

  return (
    <Button className='my-2 mx-2' variant='success' onClick={()=>change_office()}>Go To {content}</Button>
  );
}

function AddButton(props) {
  return (
    <Link to="/pages/add"><Button className='AddButton'>+</Button></Link>
  );
}

export {ListOfPages};