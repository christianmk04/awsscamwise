import { ProgressBar, Container, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ProgressBarStats = ({activity, progress, level, pointsToNextLevel, description, variant }) => {
  return (
    <Container className='bg-light p-3 rounded-3'>
      <Row className="align-items-center">
        <Col xs={12} md={8}>
          <h5 className='fw-bold'>Overall {activity} progress</h5>
          <ProgressBar
            now={progress}
            style={{
              height: '3em',
              border: '3px solid black',
            }}
            variant={variant}
            className='rounded-pill'
          />
        </Col>
        <Col xs={12} md={4} className="text-md-end text-center mt-2 mt-md-0">
          <span
            style={{
              fontWeight: 'bold',
              color: '#1a0b40',
              fontSize: '16px',
            }}
          >
            {level}
          </span>
        </Col>
      </Row>
      <Row>
        <Col className="mt-2 text-center text-md-start">
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#6c757d', // Grey text
            }}
          >
            {pointsToNextLevel} points to the next level. {description}
          </p>
        </Col>
      </Row>
    </Container>
  )
}

// PropType definitions
ProgressBarStats.propTypes = {
  activity: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  level: PropTypes.string.isRequired,
  pointsToNextLevel: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
};

export default ProgressBarStats