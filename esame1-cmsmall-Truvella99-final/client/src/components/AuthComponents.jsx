import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetUserContext,HandleErrorContext,SetDirtyContext } from './Contexts';
import API from '../API';
import validator from 'validator';

// Form component to Perform Login
function LoginForm(props) {
  // email and password of the user for login (controlled form)
  const [email, setEmail] = useState('u1@p.it');
  const [password, setPassword] = useState('pass');
  // props to set the user state after successfully logged in
  const setUser = useContext(SetUserContext);
  // context of setDirty, to trigger data rehydrating
  const setDirty = useContext(SetDirtyContext);
  // HandleError function context for handling errors
  const HandleError = useContext(HandleErrorContext);
  // setInForm state, passed as a prop, used to not show Login button of the navbar if we have already opened the login form
  // and we are not logged in
  const {setInForm} = props;
  // navigate to return to / after login
  const navigate = useNavigate();
  // login function to perform login
  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        // login successfull, remove eventual error message and set user state
        setUser(user);
        // rehydrate data
        setDirty(true);
      })
      .catch(err => {
        // Error, display error message
        HandleError(err);
      })
  }
  
  const goHome = () => {
    navigate('/');
    // enable Login Button on Navbar if not Logged
    setInForm(false);
    // refresh data
    setDirty(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // enable Login Button on Navbar if not Logged
    setInForm(false);
    // take the user credentials
    const credentials = { username: email, password: password };
    // FORM VALIDATION
    let valid = true;
    if (email === '' || password === '' || !validator.isEmail(email))
      valid = false;
    if (valid) {
      // Validation Passed, send the request to the server
      doLogIn(credentials);
    } else {
      // Validation Failed, show proper error message
      if (password === '' && email === '') {
        HandleError({error: 'Empty Email and Password.'});
      } else if (!validator.isEmail(email)) {
        HandleError({error: 'Wrong Email.'});
      } else {
        HandleError({error: 'Empty Password.'});
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
                          <Form.Control type='email' value={email} onChange={ev => setEmail(ev.target.value)} />
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