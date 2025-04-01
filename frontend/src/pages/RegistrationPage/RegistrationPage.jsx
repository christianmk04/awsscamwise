import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { Container, Row, Col, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { TrophySpin } from 'react-loading-indicators';

const RegistrationPage = () => {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Check if the password and confirm password match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        setLoading(true);

        try {
        const response = await fetch('http://172.31.17.239:5001/register_action', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: email,
                username: username, 
                password: password, 
                confirm_password: confirmPassword }),
            });

            setLoading(false);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    navigate('/registration-success');
                } else {
                    setErrorMessage(`Registration failed: ${data.message}`);
                }
            } else {
                setErrorMessage('Server error occurred. Please try again later.');
            }
            } catch (error) {
                setLoading(false);
                setErrorMessage(`Network error: ${error}`);
            }
    };

    return (
        <>

            <Modal show={loading} centered>
                <Modal.Body className="text-center">
                    <TrophySpin color={["#add8e6", "#c4cfea", "#d4c7e1", "#e3bfcf", "#f2b6c4", "#ffd1dc"]} size="large" text="" textColor="" className="mb-3"/>
                    {/* <Spinner animation="border" variant="primary" className="mb-3" /> */}
                    <p>Registering your account, please hold...</p>
                </Modal.Body>
            </Modal>

            <div className="page-wrapper" style={{ backgroundColor: '#13072e' }}>
                <Container fluid className="p-0 w-50 w-md-75">
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col xs={12} md={10} lg={8} xl={8}>
                    <div className='registration-container'>

                        <div className='logo-container mx-auto d-block text-center mb-5'> 
                            <img 
                                src="logo.png" 
                                alt="ScamWise Logo" 
                                className="logo-image img-fluid py-5"
                            />
                        <div className='border border-light'></div>
                        </div>

                        <div className='preamble-text-container mb-5 text-light text-center'>
                            <h3 className='title-text pb-3'>Welcome to ScamWise!</h3>
                            <p className='body-text'>
                                Please enter your email address, username and password to create an account.
                            </p>
                            {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
                        </div>

                        <Form className='mx-auto d-block' onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label className='text-light fw-bold'>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter Your Email Address"
                                    className="rounded-pill px-3 py-2"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicUsername">
                                <Form.Label className='text-light fw-bold'>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Your Username"
                                    className="rounded-pill px-3 py-2"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label className='text-light fw-bold'>Password</Form.Label>
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
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter Your Password"
                                        className="rounded-pill px-3 py-2"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                            </Form.Group>

                            <Form.Group className="mb-5" controlId="formBasicConfirmPassword">
                                <Form.Label className='text-light fw-bold'>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="rounded-pill px-3 py-2"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Form.Group>

                            <Button variant="light" type="submit" className='mx-auto d-block rounded-pill'>
                                <div className="d-flex align-items-center">
                                <span>Sign Up</span>
                                <i className="material-symbols-rounded ms-2">app_registration</i>
                                </div>
                            </Button>
                        </Form>

                        <div className='other-functions text-light text-center mt-3'>
                            <p className="login-text">
                                Already have an account? <Link to="/login" className='text-white'>Login here.</Link>
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

export default RegistrationPage