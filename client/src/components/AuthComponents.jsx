import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandleErrorContext, SetUserContext,SetDirtyContext } from "../App";
import API from '../API';
import validator from 'validator';

function LoginForm(props) {
  // email and password of the user for login (controlled form)
  const [email, setemail] = useState('enrico@gmail.com');
  const [password, setPassword] = useState('pass');
  // props to set the user state after successfully logged in
  const setUser = useContext(SetUserContext);
  // contest of setDirty
  const setDirty = useContext(SetDirtyContext);
  // error message state for handling errors
  const HandleError = useContext(HandleErrorContext);
  // not showing Login button of the navbar if we have already opened the login form
  const {setInForm} = props;
  // navigate to return to / after login
  const navigate = useNavigate();
  // login function to perform login
  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        // login successfull, remove eventual error message and set user state
        setUser(user);
        // refresh data
        setDirty(true);
      })
      .catch(err => {
        // Error, display generic error message
        HandleError(err);
      })
  }
  
  const goHome = () => {
    navigate('/');
    setInForm(false);
    // refresh data
    setDirty(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // make reappear the ogin button on top of the navbar
    setInForm(false);
    //setErrorMessage('');
    const credentials = { username: email, password: password };
    // FORM VALIDATION
    let valid = true;
    if (email === '' || password === '' || !validator.isEmail(email))
      valid = false;

    if (valid) {
      // Validation Passed, send the request to the server
      doLogIn(credentials);
    } else {
      // Validation Failed, show error message
      if (password === '' && email === '') {
        HandleError('Empty Email and Password.')
      } else if (!validator.isEmail(email)) {
        HandleError('Wrong Email.')
      } else {
        HandleError('Empty Password.')
      }
    }
  };
  
  return (
      <>
      <Container>
          <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                  <h2>Login</h2>
                  <Form onSubmit={handleSubmit}>
                      <Form.Group controlId='email'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control type='email' value={email} onChange={ev => setemail(ev.target.value)} />
                      </Form.Group>
                      <Form.Group controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button className='my-2' type='submit'>Login</Button>
                      <Button className='my-2 mx-2' variant='danger' onClick={()=>goHome()}>Cancel</Button>
                  </Form>
              </Col>
              <Col xs={3}></Col>
          </Row>
      </Container>
      </>
    )
}

export { LoginForm };