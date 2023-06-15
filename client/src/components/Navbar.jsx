import { useContext,useState } from "react";
import { Navbar, Container, Row, Col, Button,Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserContext,SetUserContext,HandleErrorContext,SetDirtyContext } from "../App";
import API from "../API";

function NavHeader(props) {
    // not showing Login button of the navbar if we have already opened the login form
    const {inForm, setInForm} = props;
    // navigate to return to / after logout
    const navigate = useNavigate();
    // user state shared with useContext hook
    const user = useContext(UserContext);
    // props to set the user state after successfully logged out
    const setUser = useContext(SetUserContext);
    // props to set the dirty state when changing page
    const setDirty = useContext(SetDirtyContext);
    // username of the user, if defined (logged in) show it along with logout button
    const username = user.username;
    // permission of the user, if Admin, make website name editable, alon with the possibility to save the new name.
    const isAdmin = (user.isAdmin === 1);
    // error message state for handling errors
    const HandleError = useContext(HandleErrorContext);
    // name of the website state
    const {websiteName} = props;
    // state for edit the websiteName field
    const [editable,setEditable] = useState(false);
    // state for the current value of website name during the editing
    const [editingName,setEditingName] = useState(websiteName);

    // function to save the website name persistently
    function saveWebsiteName(new_name) {
        // disable name editing
        setEditable(false);
        props.updateWebsiteName(new_name);
    }

    // logout function
    const doLogOut = () => {
        API.logOut()
            .then(user => {
                setUser({});
                // refresh data
                setDirty(true);
                navigate('/');
            })
            .catch(err => {
                // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
                HandleError(err.message);
            })
    };
    
    // function that perform preliminary operations to go to the login form
    const goToLogin = () => {
        navigate('/login');
        setInForm(true);
        // refresh data
        setDirty(true);
    };

    return (
        <>
        <Navbar bg='success' variant='dark'>
            <Container fluid>
                <Navbar.Brand className='fs-2' style={(isAdmin && editable) ? {backgroundColor: 'grey'} : {}} contentEditable={isAdmin && editable} suppressContentEditableWarning={true} onInput={(event) => { setEditingName(event.target.textContent) }}>{websiteName}</Navbar.Brand>
                { isAdmin ? <><Button className='mx-2' variant='primary' onClick={() => saveWebsiteName(editingName)}>Change Website Name</Button> <Button className='mx-2' variant='warning' onClick={() => setEditable(true)}>Edit Website Name</Button></> : ''}
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
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