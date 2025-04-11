import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { Container, Row, Col, Modal } from 'react-bootstrap';
import ErrorModal from '../../components/ErrorModal';
import { TrophySpin } from 'react-loading-indicators';

const LoginPage = () => {

  // State for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for login failure
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize navigate hook
  const navigate = useNavigate();

  // Close error popup
  const handleCloseError = () => setShowError(false);

  // Login handler function
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    setErrorMessage(''); // Clear error message

    setLoading(true); // Set loading state to true

    try {
      const response = await fetch('http://18.214.76.26:5001/login_action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          password:password 
        }), // Send email and password as JSON
      });

      setLoading(false); // Set loading state to false

      if (response.ok) {
        const data = await response.json();
        if (data.success) {

          localStorage.setItem('userId', data.user_id); // Store user ID in local storage
          localStorage.setItem('role', data.role); // Store user role in local storage

          // Check if data.firstTimeLogin is true
          if (data.firstTimeLogin) {
            // Redirect to 18.214.76.26:5173/first-time-details and pass the user ID as a query parameter
            navigate(`/first-time-details`);
            return;
          }

          console.log('Login successful:', data.message);
          navigate(`/home`); // Redirect to 18.214.76.26:5173/
        } else {
          console.error('Login failed:', data.message);
          setErrorMessage(data.message); // Set error message from server
          setShowError(true); // Show error popup
        }
      } else {
        console.error('Server error:', response.status);
        setErrorMessage('An unexpected server error occurred.');
        setShowError(true); // Show error popup for server error
      }

      

    } catch (error) {
      setLoading(false); // Set loading state to false
      console.error('Network error:', error);
      setErrorMessage('A network error occurred. Please try again later.');
      setShowError(true); // Show error popup for network error
    }
  };

  return (

    <>

    <Modal show={loading} centered>
        <Modal.Body className="text-center">
            <TrophySpin color={["#add8e6", "#c4cfea", "#d4c7e1", "#e3bfcf", "#f2b6c4", "#ffd1dc"]} size="large" text="" textColor="" className="mb-3"/>
            {/* <Spinner animation="border" variant="primary" className="mb-3" /> */}
            <p>Logging into ScamWise, please hold on!</p>
        </Modal.Body>
    </Modal>

      <div className="page-wrapper" style={{ backgroundColor: '#13072e' }}>
        <Container fluid className="p-0 w-50 w-md-75">
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs={12} md={10} lg={8} xl={8}>
              <div className='login-container'>

                <div className='logo-container mx-auto d-block text-center mb-5'> 
                  <img 
                    src="../../public/logo.png" 
                    alt="ScamWise Logo" 
                    className="logo-image img-fluid py-5"
                  />
                  <div className='border border-light'></div>
                </div>

                <div className='preamble-text-container mb-5 text-light text-center'>
                    <h3 className='title-text pb-3'>Welcome to ScamWise!</h3>
                    <p className='body-text'>
                        Enter your email address and password to sign in to your account.
                    </p>
                </div>

                <Form className='mx-auto d-block' onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control 
                      type="email" 
                      placeholder="Enter Your Email Address" 
                      className='rounded-pill px-3 py-2' 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}/>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Control 
                      type="password" 
                      placeholder="Enter Your Password" 
                      className='rounded-pill px-3 py-2' 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}/>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="Keep Me Signed In" className='text-light' id='login-keep-signed-in'/>
                  </Form.Group>
                  <Button variant="light" type="submit" className='mx-auto d-block rounded-pill'>
                    <div className="d-flex align-items-center">
                      <span>Sign In</span>
                      <i className="material-symbols-rounded ms-2">login</i>
                    </div>
                  </Button>
                </Form>

                <div className='other-functions text-light text-center mt-3'>
                  
                  <p className="signup-text">
                    Don&apos;t have an account? <Link to="/registration" className='text-white'>Sign up here.</Link>
                  </p>

                  <p className="forgot-password">
                    <Link to="/forgot-password" className='text-white'>Forgot your Password?</Link>
                  </p>
                </div>

                
              </div>
            </Col>
          </Row>
        </Container>
      </div>

       {/* Error Modal */}
       <ErrorModal show={showError} onClose={handleCloseError} message={errorMessage} />
    </>
  );
};

export default LoginPage