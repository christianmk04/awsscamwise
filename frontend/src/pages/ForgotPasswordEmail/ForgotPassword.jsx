import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { Container, Row, Col } from 'react-bootstrap';

const ForgotPassword = () => {
    return (
        <>
            <div className="page-wrapper" style={{ backgroundColor: '#13072e' }}>
                <Container fluid className="p-0 w-50 w-md-75">
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col xs={12} md={10} lg={8} xl={8}>
                    <div className='login-container'>

                        <div className='logo-container mx-auto d-block text-center mb-5'> 
                        <img 
                            src="../../public/logo.png" 
                            alt="ScamWise Logo" 
                            className="logo-image img-fluid pb-3 w-25 h-auto"
                        />
                        <span 
                            className="logo-text fs-1 h1 text-light p-3">
                            ScamWise
                        </span>  
                        </div>

                        <div className='preamble-text-container mb-5 text-light text-center'>
                            <h3 className='title-text pb-3'>Forgot Your Password?</h3>
                            <p className='body-text'>
                                Please enter your email address below and we will send you a 6-digit code to reset your password.
                            </p>
                        </div>

                        <Form className='mx-auto d-block mb-5'>
                        <Form.Group className="mb-5" controlId="formBasicEmail">
                            <Form.Control type="email" placeholder="Enter Your Email Address" className='rounded-pill px-3 py-2' id='login-email'/>
                        </Form.Group>

                        <Button variant="light" type="submit" className='mx-auto d-block rounded-pill'>
                            <div className="d-flex align-items-center">
                            <span>Get Code</span>
                            <i className="material-symbols-rounded ms-2">prompt_suggestion</i>
                            </div>
                        </Button>
                        </Form>

                        <div className='other-functions text-light text-center mt-3'>
                        <p className="signup-text">
                            Don&apos;t have an account? <Link to="/register" className='text-white'>Sign up here.</Link>
                        </p>

                        <p className="login-text">
                            <Link to="/login" className='text-white'>Login here.</Link>
                        </p>
                        </div>

                        
                    </div>
                    </Col>
                </Row>
                </Container>
            </div>
        </>
    )
}

export default ForgotPassword