import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState,createContext, useEffect,useContext } from 'react'
import {NavHeader} from './components/Navbar'
import {LoginForm} from './components/AuthComponents'
import { BrowserRouter,Routes,Route,Navigate,Link } from 'react-router-dom' ;
import API from './API';
import dayjs from 'dayjs';
import './App.css';
import { Alert,Row,Col,Button, Container } from 'react-bootstrap';
import {ListOfPages} from './components/PageList';
import {PageComponent} from './components/PageComponent';
import { UserContext,SetUserContext,HandleErrorContext,SetDirtyContext } from './components/Contexts';
import { LoadingSpinner } from './components/Loading';

function App() {
  // state of the user
  const [user, setUser] = useState({id: undefined, email: undefined, isAdmin: undefined, username: undefined});
  // list of pages in the application
  const [pageList, setPageList] = useState([]);
  // dirty state to refresh content
  const [dirty,setDirty] = useState(true);
  // not showing Login button of the navbar if we have already opened the login form
  const [inForm,setInForm] = useState(false);
  // error message state for handling errors
  const [errorMessage, setErrorMessage] = useState('');
  // name of the webiste state
  const [websiteName,setWebsiteName] = useState('');
  // loading state: handle the first resource loading, showing a loading spinner
  const [initialLoading,setInitialLoading] = useState(true);

  // function to handle the application errors, all displayed into the Alert under the NavHeader
  function handleError(err) {
    let errMsg = 'Unkwnown error';
    if (err.error) {
      errMsg = err.error;
    }
  
    setErrorMessage(errMsg);
    setDirty(true);
  }

  async function getWebsiteName() {
    try {
      const websiteName = await API.getWebsiteName();
      setWebsiteName(websiteName.name);
      setDirty(false);
      // here because we disable the spinner when we have retrieved all the data
      setInitialLoading(false);
    } catch (err) {
      handleError(err);
    }
  }

  // useeffect to retrieve all data related to the pages and the website name
  useEffect(() => {
    async function getAllPages() {
      try {
        let pages;
        if (user.id) {
          // get backoffice pages
          pages = await API.getPagesBackOffice();
        } else {
          // get frontoffice pages
          pages = await API.getPagesFrontOffice();
        }
        setPageList(pages);
        setDirty(false);
      } catch (err) {
        handleError(err);
      }
    }; 
    if (dirty) {
      getAllPages();
      getWebsiteName();
    }
  },[dirty]);

  //useEffect to try to retrieve user info (if logged in or not), executed only the first time when mounting the component
  useEffect(() => {
    async function checkAuth() {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        //setLoggedIn(true);
        setUser(user);
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    }
    checkAuth();
  },[]);

  // function to update the website name
  function updateWebsiteName(new_name) {
    setWebsiteName(new_name);

    API.updateWebsiteName(new_name)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  // function to add a page
  function addPage(page) {
    setPageList((oldpageList) => [...oldpageList,page]);
    API.createPage(page)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  // function to delete a page
  function deletePage(pageId) {
    setPageList((pageList) => pageList.filter( (page) => {
      if (page.id !== pageId) {
        return true;   
      } else {
        return false;
      }
    } 
    ));

    API.deletePage(pageId)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  return (
    <>
      {initialLoading && <LoadingSpinner/>}
      <BrowserRouter>
        <UserContext.Provider value={user}>
          <SetUserContext.Provider value={setUser}> {/*Forse non Serve col context*/}
            <HandleErrorContext.Provider value={handleError}>
              <SetDirtyContext.Provider value={setDirty}> {/*Forse non Serve col context*/}
                <NavHeader inForm={inForm} setInForm={setInForm} websiteName={websiteName} updateWebsiteName={updateWebsiteName}/>
                {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
                <Routes>
                  <Route path='/' element={<ListOfPages front_office={true} pageList={pageList} deletePage={deletePage} />} />
                  <Route path='/backoffice' element={user.id ? <ListOfPages front_office={false} pageList={pageList} deletePage={deletePage} /> : <Navigate replace to='/' />} />
                  <Route path='/login' element={user.id ? <Navigate replace to='/backoffice'/> : <LoginForm setInForm={setInForm} />} />
                  <Route path='/pages/add' element={user.id ? <PageComponent getWebsiteName={getWebsiteName} location={'add'}/> : <Navigate replace to='/'/> }/>
                  <Route path='/pages/view/:id' element={<PageComponent getWebsiteName={getWebsiteName} location={'view'}/>} />
                  <Route path='/pages/edit/:id' element={user.id ? <PageComponent getWebsiteName={getWebsiteName} location={'edit'}/> : <Navigate replace to='/'/> } />
                  <Route path='*' element={<DefaultRoute/>} />
                </Routes>
              </SetDirtyContext.Provider>
            </HandleErrorContext.Provider>
          </SetUserContext.Provider>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  )
}

function DefaultRoute() {
  // props to set the dirty state when changing page
  const setDirty = useContext(SetDirtyContext);
  return(
      <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        <Col>
          <h1>Nothing here...</h1>
          <p>This is not the route you are looking for!</p>
          <Link to="/">
            <Button type="button" variant="success" className="btn btn-lg edit-button" onClick={() => setDirty(true)}>Go back to the homepage</Button>
          </Link>
        </Col>
      </div>
  );
}

export default App;
