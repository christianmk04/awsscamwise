import PropTypes from 'prop-types';
import { Card, Nav } from 'react-bootstrap';
import { useState } from 'react';

const SelectionCard = ({ title, description, icon_url, link, color = "linear-gradient(135deg, #4b6cb7, #182848)" }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Nav.Link 
      href={link} 
      className="h-100 text-decoration-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`custom-card text-center h-100 p-4 border-0 shadow-sm ${isHovered ? 'card-hover' : ''}`}
        style={{
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.06)'
        }}
      >
        <div className="card-gradient position-absolute w-100 h-100 top-0 start-0" 
          style={{ 
            background: color,
            opacity: '0.08',
            borderRadius: '16px',
            zIndex: 0
          }}
        />
        
        <div className="icon-container mb-4 mx-auto d-flex align-items-center justify-content-center"
          style={{
            background: color, 
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            position: 'relative',
            zIndex: 1
          }}
        >
          <img 
            src={icon_url} 
            alt={`${title} icon`} 
            className="card-icon" 
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
            
            }} 
          />
        </div>
        
        <Card.Body className="position-relative z-1 d-flex flex-column">
          <Card.Title className="card-title fw-bold fs-4 mb-3">{title}</Card.Title>
          <Card.Text className="card-description text-secondary mb-4">{description}</Card.Text>
          
          <div className="mt-auto">
            <span 
              className={`btn btn-sm rounded-pill px-3 ${isHovered ? 'btn-primary' : 'btn-outline-primary'}`}
              style={{ transition: 'all 0.3s ease' }}
            >
              Explore
            </span>
          </div>
        </Card.Body>
      </Card>
    </Nav.Link>
  );
};

// Props Validation
SelectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon_url: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  color: PropTypes.string
};

export default SelectionCard;