import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProtectionPage = () => {
    const navigate = useNavigate();

    const handleRedirectToLogin = () => {
    navigate('/login'); // Redirect to login page

    };
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center">
                <Col xs={12} sm={8} md={6}>
                <Card className="shadow-lg rounded-lg">
                    <Card.Body>
                        <div className='mx-auto text-center'>
                            <img src="/logo2.png" style={{'width': '290px', 'height': '80px'}} alt="" />
                        </div>

                    <Card.Title className="text-center" style={{ fontSize: '2rem' }}>
                        <i className="bi bi-exclamation-triangle-fill" style={{ color: '#f8c146', fontSize: '3rem' }}></i>
                        <br />
                        Authentication Required
                    </Card.Title>
                    <Card.Text className="text-center" style={{ fontSize: '1.2rem' }}>
                        It seems like you are trying to access a restricted page. Please log in to continue.
                    </Card.Text>
                    <div className="text-center">
                        <Button variant="primary" size="lg" onClick={handleRedirectToLogin}>
                        Go to Login
                        </Button>
                    </div>
                    </Card.Body>
                </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default ProtectionPage