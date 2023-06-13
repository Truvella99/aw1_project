import { useContext,useState } from "react";
import { Navbar, Container, Row, Col, Button,Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserContext,SetUserContext,HandleErrorContext } from "../App";
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
    // username of the user, if defined (logged in) show it along with logout button
    const username = user.username;
    // permission of the user, if Admin, make website name editable, alon with the possibility to save the new name.
    const isAdmin = (user.isAdmin === 1);
    // error message state for handling errors
    const HandleError = useContext(HandleErrorContext);

    // logout function
    const doLogOut = () => {
        API.logOut()
            .then(user => {
                setUser({});
                navigate('/');
            })
            .catch(err => {
                // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
                HandleError(err.message);
            })
    };
    
    return (
        <>
        <Navbar bg='success' variant='dark'>
            <Container fluid>
                <Navbar.Brand className='fs-2' contentEditable={isAdmin} suppressContentEditableWarning={true}>Cambiare</Navbar.Brand>
                { isAdmin ? <Button className='mx-2' variant='primary' onClick={props.logout}>Change Website Name</Button> : ''}
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    {username ? (<>
                        <Navbar.Text className='fs-5'>
                            {"Signed in as: " + username}
                        </Navbar.Text>
                        <Button className='mx-2' variant='danger' onClick={() => doLogOut()}>Logout</Button>
                    </>) : (
                        inForm ? '' : <Button className='mx-2' variant='warning' onClick={() => {navigate('/login'); setInForm(true);}}>Login</Button>)}
                </Navbar.Collapse>
            </Container>
        </Navbar>
        </>
    );
}

export {NavHeader};