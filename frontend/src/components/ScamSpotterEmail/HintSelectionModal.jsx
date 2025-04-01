import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const HintInformationModal = ({ show, onClose }) => {
  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      backdrop="static" 
      keyboard={false}
      className="cyber-modal"
      contentClassName="bg-dark"
    >
      <Modal.Header className="bg-dark text-light border-bottom border-info">
        <Modal.Title className="w-100 text-center" style={{ color: '#00fff7' }}>
          <i className="fa fa-lightbulb me-2"></i>
          HINT SYSTEM
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light p-4">
        <div className="text-center mb-4">
          <div className="cyber-box p-3 mb-4" style={{ 
            border: '1px solid #00fff7', 
            backgroundColor: 'rgba(33, 15, 61, 0.8)',
            boxShadow: '0 0 10px rgba(0, 255, 247, 0.5)' 
          }}>
            <p className="mb-3">
              During this session, you can use the <strong style={{ color: '#00fff7' }}>SELECT</strong> mode to reveal hints.
            </p>
            <p className="mb-0">
              <strong style={{ color: '#ff3e3e' }}>EACH HINT WILL COST 5 XP</strong> from your final score.
            </p>
          </div>

          <div className="d-flex align-items-center justify-content-center mb-4">
            <div className="text-center mx-3">
              <div className="cyber-circle" style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(0, 255, 247, 0.1)',
                border: '2px solid #00fff7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 255, 247, 0.3)'
              }}>
                <span style={{ fontSize: '24px', color: '#00fff7' }}>5</span>
              </div>
              <p className="mt-2">Maximum Hints</p>
            </div>
            
            <div className="cyber-arrow mx-4" style={{ color: '#00fff7', fontSize: '24px' }}>
              ⟷
            </div>
            
            <div className="text-center mx-3">
              <div className="cyber-circle" style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 62, 62, 0.1)',
                border: '2px solid #ff3e3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(255, 62, 62, 0.3)'
              }}>
                <span style={{ fontSize: '24px', color: '#ff3e3e' }}>-25</span>
              </div>
              <p className="mt-2">Maximum XP Loss</p>
            </div>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: 'rgba(0, 0, 0, 0.3)', 
            border: '1px solid rgba(0, 255, 247, 0.3)',
            borderRadius: '5px'
          }}>
            <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <i className="fa fa-info-circle me-2"></i>
              To use a hint:
            </p>
            <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Click the <strong style={{ color: '#00fff7' }}>SELECT</strong> button to enter hint mode, then click on any suspicious element to check if it's malicious
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center bg-dark border-top border-info">
        <Button
          onClick={onClose}
          className="cyber-btn"
          style={{
            backgroundColor: "rgba(33, 15, 61, 0.9)",
            color: "#00fff7",
            borderColor: "#00fff7",
            boxShadow: "0 0 8px rgba(0, 255, 247, 0.6)",
            padding: "10px 30px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          Understood - Begin Mission
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// PropType checking
HintInformationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default HintInformationModal;