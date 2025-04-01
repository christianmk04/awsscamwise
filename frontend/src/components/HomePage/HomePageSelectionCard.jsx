import { Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

const HomePageSelectionCard = ({ title, description }) => {
  return (
  
    <Card
      style={{
        backgroundColor: '#1a0b40',
        position: 'relative', // Enable positioning for icon overlay
        borderImage: 'linear-gradient(to right, #add8e6, #ffb6c1) 1', // Baby blue to pastel pink gradient for the border
      }}
      className='p-4 rounded-4 text-white border border-5'
    >
      <Card.Body>
        <Card.Title className="fs-3 d-flex align-items-center gap-2">
          {title}
        </Card.Title>
        <Card.Text className='mt-4'>{description}</Card.Text>
      </Card.Body>
    </Card>


  )
}

// PropType Definitions
HomePageSelectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  comingSoon: PropTypes.bool,
}

export default HomePageSelectionCard