import { Container, Card, Row, Col } from 'react-bootstrap';

const Notifications = () => {

    const notificationsList = [
        'You managed to trick a user with crafted email #9. Kudos!',
        'You managed to trick a user with crafted email #9. Kudos!',
        'You have 3 unread email challenges. Start solving them today!',
        'You have 3 unread email challenges. Start solving them today!',
      ];

    return (
        <>
            <Container
                style={{
                    border: '1px solid #d3d3d3',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#fff',
                }}
                >
                {notificationsList.map((text, index) => (
                    <Card
                    key={index}
                    className="mb-2"
                    style={{
                        border: 'none',
                        borderBottom: '1px solid #d3d3d3',
                        borderRadius: '0',
                        padding: '10px 5px',
                    }}
                    >
                        <Row className="align-items-center">
                            <Col xs={10}>
                            <p style={{ margin: 0, color: '#1a0b40', fontSize: '14px' }}>{text}</p>
                            </Col>
                            <Col xs={2} className="text-end">
                                <img className='w-25 h-auto' src="../../public/arrow.png" alt="" />
                            </Col>
                        </Row>
                    </Card>
                ))}
            </Container>
        </>
    )
}

export default Notifications