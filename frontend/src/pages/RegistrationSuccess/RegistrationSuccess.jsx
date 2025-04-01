import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap';

const RegistrationSuccess = () => {
  return (
    <>
        <div className="page-wrapper" style={{ backgroundColor: '#13072e' }}>
            <Container fluid className="p-0 w-50 w-md-75">
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col xs={12} md={10} lg={8} xl={8}>
                        <div className='registration-container'>

                            <div className='logo-container mx-auto d-block text-center mb-2'> 
                                <img 
                                        src="/logo2.png" 
                                        alt="ScamWise Logo" 
                                        className="logo-image img-fluid pb-3"
                                    />
                            </div>

                            <div className='preamble-text-container mb-5 text-light text-center'>

                                <img src="../../public/reg_success.png" className='w-75 mb-5' alt="" />

                                <h3 className='title-text pb-3'>Registration Successful!</h3>
                                <p className='body-text'>
                                    We have sent you an email to verify your account. Please check your inbox and click on the link provided to activate your account before you logging in.
                                </p>
                            </div>

                            <div className='other-functions text-light text-center mt-3 fs-4'>
                                <p className="login-text">
                                Already activated your account? <Link to="/login" className='text-white fw-bold'>Login here.</Link>
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

export default RegistrationSuccess