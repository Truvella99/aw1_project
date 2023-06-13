import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState,createContext,useContexte, useEffect } from 'react'
import {NavHeader} from './components/Navbar'
import {LoginForm} from './components/AuthComponents'
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom' ;
import API from './API';
import dayjs from 'dayjs';
import './App.css';
import { Alert } from 'react-bootstrap';
import {ListOfPages} from './components/PageList';

// user information shared context
const UserContext = createContext(null);
// setuser function shared context
const SetUserContext = createContext(null);
// HandleError function shared context
const HandleErrorContext = createContext(null);
// setDirty function shared context
const SetDirtyContext = createContext(null);

export {UserContext,SetUserContext,HandleErrorContext,SetDirtyContext};

function App() {
  // state of the user
  const [user, setUser] = useState({id: undefined, email: undefined, isAdmin: undefined, username: undefined});
  // list of pages in the application
  const [pageList, setPageList] = useState([]);
  // dirty state to refresh content
  const [dirty,setDirty] = useState(false);
  // loading state TODO
  const [initialLoading,setInitialLoading] = useState(true);
  // not showing Login button of the navbar if we have already opened the login form
  const [inForm,setInForm] = useState(false);
  // error message state for handling errors
  const [errorMessage, setErrorMessage] = useState('');

  function handleError(err) {
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0].msg) {
        errMsg = err.errors[0].msg;
      }
    } else if (err.error) {
      errMsg = err.error;
    }
  
    setErrorMessage(errMsg);
    setDirty(true);
  }

  useEffect(() => {
    async function getAllPages() {
      try {
        const pages = await API.getPages();
        setPageList(pages);
        setDirty(false);
        //setInitialLoading(false);
      } catch (err) {
        handleError(err);
      }
    };
    getAllPages();
  },[dirty]);
  
  function deletePage(pageId) {
    console.log(pageId);
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
      <BrowserRouter>
        <UserContext.Provider value={user}>
          <SetUserContext.Provider value={setUser}> {/*Forse non Serve col context*/}
            <HandleErrorContext.Provider value={handleError}>
              <SetDirtyContext.Provider value={setDirty}>
                <NavHeader inForm={inForm} setInForm={setInForm} />
                {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
                <Routes>
                  <Route path='/' element={<ListOfPages front_office={true} pageList={pageList} ChangeOffice={'/backoffice'} deletePage={deletePage} />} />
                  <Route path='/backoffice' element={<ListOfPages front_office={false} pageList={pageList} ChangeOffice={'/'} deletePage={deletePage} />} />
                  <Route path='/login' element={user.id ? <Navigate replace to='/backoffice' /> : <LoginForm setInForm={setInForm} />} />
                  <Route path='/pages/add' element={<></>} />
                  <Route path='/pages/view/:id' element={<></>} />
                  <Route path='/pages/edit/:id' element={<></>} />
                  <Route path='*' element={<Navigate replace to='/' />} />
                </Routes>
              </SetDirtyContext.Provider>
            </HandleErrorContext.Provider>
          </SetUserContext.Provider>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  )
}

export default App;
