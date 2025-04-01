import { Row, Col, Card, ProgressBar } from 'react-bootstrap';

const tierColors = {
  Black: '#343a40',
  Bronze: '#b08d57',
  Silver: '#c0c0c0',
  Gold: '#d4af37',
};

const getProgressBarColor = (progress) => {
  if (progress <= 25) return 'danger'; // Red
  if (progress <= 50) return 'warning'; // Yellow
  if (progress <= 75) return 'primary'; // Blue
  return 'success'; // Green
};

const ProgressCard = ({ progress }) => {
  return (
    <>
      <Row>
        {Object.entries(progress).map(([key, badge]) => {
          const currentTier = badge.current_tier || "Black";
          const nextTier = badge.next_tier || "Highest Tier Reached";
          const tierColor = tierColors[currentTier] || '#343a40';

          // Calculate progress percentage
          const progressPercentage = badge.next_tier 
          ? 100 - (badge.value_left / (badge.current_value + badge.value_left) * 100) 
          : 100;

          // Determine labels for counters
          const valueLabel = key === "quizzes_contributed" ? "Quizzes" : "XP";
          const valueLeftLabel = key === "quizzes_contributed" ? "Quizzes" : "XP Left";

          return (
            <Col key={key} xs={12} sm={6} md={4} className="mb-3">
              <Card
                style={{
                  backgroundColor: tierColor,
                  color: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                }}
                className='h-100'
              >
                <Card.Body>
                  <Card.Title className="text-center">{badge.name}</Card.Title>
                  <Card.Subtitle className="mb-3 text-center">
                    <strong>Current Tier:</strong> {currentTier}
                  </Card.Subtitle>

                  <div className='border border-1 my-3'></div>

                  <Card.Text>
                    <div className="d-flex justify-content-between">
                      <span><strong>Current Value:</strong> {badge.current_value} {valueLabel}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span><strong>Next Tier:</strong> {nextTier}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span><strong>Value Left:</strong> {badge.value_left} {valueLeftLabel}</span>
                    </div>
                    
                  </Card.Text>

                   {/* Progress Bar */}
                  <ProgressBar 
                    now={progressPercentage} 
                    variant={getProgressBarColor(progressPercentage)} 
                    style={{ height: '10px', marginTop: '10px' }} 
                    animated 
                  />
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}

export default ProgressCard;
