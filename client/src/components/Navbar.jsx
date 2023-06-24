import { useContext,useState } from "react";
import { Navbar, Container, Row, Col, Button,Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserContext,SetUserContext,HandleErrorContext,SetDirtyContext } from './Contexts';
import API from "../API";

function NavHeader(props) {
    // inForm and setInForm state, passed as a prop, used to not show Login button of the navbar if we have already opened the login form
    // and we are not logged in
    const {inForm, setInForm} = props;
    // navigate to return to / after logout
    const navigate = useNavigate();
    // user shared context with useContext hook
    const user = useContext(UserContext);
    // setUser shared context with useContext hook
    const setUser = useContext(SetUserContext);
    // setDirty shared context with useContext hook
    const setDirty = useContext(SetDirtyContext);
    // username of the user, if defined (logged in) show it along with logout button
    const username = user.username;
    // permission of the user, if Admin, make website name editable, alon with the possibility to save the new name.
    const isAdmin = (user.isAdmin === 1);
    // HandleError shared context with useContext hook
    const HandleError = useContext(HandleErrorContext);
    // name of the website state, passed as a prop from App
    const {websiteName} = props;
    // state for make the websiteName field editable or not
    const [editable,setEditable] = useState(false);
    // state used to store the current and temporary value (not permanent until submission) of website name during the editing
    const [editingName,setEditingName] = useState('');
    
    // function to save the website name persistently
    function saveWebsiteName(new_name) {
        // disable name editing
        setEditable(false);
        // if we click change website name without actually change nothing, avoid calling the server
        if (new_name.trim() !== '') {
            props.updateWebsiteName(new_name);
            setEditingName('');
        }
    }

    // logout function
    const doLogOut = () => {
        API.logOut()
            .then(user => {
                setUser({});
                // rehydrate data
                setDirty(true);
                // go back to the main route
                navigate('/');
            })
            .catch(err => {
                // Display error message
                HandleError(err);
            })
    };
    
    // function that perform operations to go to the login form
    const goToLogin = () => {
        navigate('/login');
        // set to true, so not show Login button of the navbar if we have already opened the login form
        setInForm(true);
        // rehydrate data
        setDirty(true);
    };

    return (
        <>
        <Navbar bg='success' variant='dark'>
            <Container fluid>
                <Navbar.Brand key={editable} className='fs-2' style={(isAdmin && editable) ? {backgroundColor: 'grey'} : {}} contentEditable={isAdmin && editable} suppressContentEditableWarning={true} onInput={(event) => { setEditingName(event.target.textContent) }}>{websiteName}</Navbar.Brand>
                {
                    /* Admin Edit Website Name Logic:
                        - If Admin, show Edit Button that set editable to true
                        - If Admin and editing (editable=true), show submit/cancel buttons to save/undo operation
                    */
                }
                { isAdmin ? 
                (<>
                    {editable ? <>  <Button className='mx-2' variant='primary' onClick={() => {saveWebsiteName(editingName); setDirty(true);}}>Submit</Button>
                                    <Button className='mx-2' variant='warning' onClick={() => {setEditable(false); setDirty(true);}}>Cancel</Button>
                                </> :
                    <Button className='mx-2' variant='primary' onClick={() => {setEditable(true); setDirty(true);}}>Edit Website Name</Button>}
                </>) 
                : ''}
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    {
                        /*  If Logged in (username defined), Show logout button and username
                            Otherwise, show login button, but only if we are not already into the login form.
                            This to avoid having two login button (navbar and form) and confusing the user.
                        */
                    }
                    {username ? (<>
                        <Navbar.Text className='fs-5'>
                            {"Signed in as: " + username}
                        </Navbar.Text>
                        <Button className='mx-2' variant='danger' onClick={() => doLogOut()}>Logout</Button>
                    </>) : (
                        inForm ? '' : <Button className='mx-2' variant='warning' onClick={() => goToLogin()}>Login</Button>)}
                </Navbar.Collapse>
            </Container>
        </Navbar>
        </>
    );
}

export {NavHeader};