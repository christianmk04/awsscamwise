import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { Container, Row, Col } from 'react-bootstrap';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

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
                            <h3 className='title-text pb-3'>We&apos;ve sent an email to your email account!</h3>
                            <p className='body-text'>
                                Check your email for a 6-digit code to reset your password. If you don&apos;t see it, check your spam folder. Enter the code below, and enter in a new password for your account!
                            </p>
                            <p className='resend-code my-3'>
                                Didn&apos;t receive the code? <a href="#" className='text-white fw-bold'>Resend Code in (60s)</a>
                            </p>
                        </div>

                        <Form className='mx-auto d-block mb-5'>
                            <Form.Group className="mb-5" controlId="formBasicResetCode">
                                <Form.Control type="number" placeholder="Enter 6-Digit Reset Code" className='rounded-pill px-3 py-2' id='reset-code'/>
                            </Form.Group>
                            
                            <Form.Group className="mb-4" controlId="formBasicPassword">
                                <Form.Label className='text-light'>Create New Password</Form.Label>
                                <OverlayTrigger placement="right" overlay={
                                        <Tooltip>
                                            Password must: 
                                            <ul>
                                                <li>Be at least 8 characters long</li>
                                                <li>Contain at least one uppercase letter</li>
                                                <li>Contain at least one lowercase letter</li>
                                                <li>Contain at least one number</li>
                                                <li>Contain at least one of the following symbols: !@#$%^&*</li>
                                            </ul>
                                        </Tooltip>
                                    }>
                                    <i className="material-symbols-rounded text-white ms-2 fs-5">info</i>
                                </OverlayTrigger>
                                <Form.Control type="password" placeholder="Enter Your New Password" className='rounded-pill px-3 py-2 mb-3' id='reset-password'/>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Control type="password" placeholder="Confirm Your Password" className='rounded-pill px-3 py-2' id='confirm-reset-password'/>
                            </Form.Group>

                            <Button variant="light" type="submit" className='mx-auto d-block rounded-pill'>
                                <div className="d-flex align-items-center">
                                <span>Reset Password</span>
                                <i className="material-symbols-rounded ms-2">reset_wrench</i>
                                </div>
                            </Button>
                        </Form>

                        <div className='other-functions text-light text-center mt-3'>
                        <p className="signup-text">
                            Don&apos;t have an account? <a href="#" className='text-white'>Sign up here.</a>
                        </p>

                        <p className="login-text">
                            <a href="#" className='text-white'>Back To Login</a>
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