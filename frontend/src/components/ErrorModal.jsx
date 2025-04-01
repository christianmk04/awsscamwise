import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ErrorModal = ({ show, onClose, message }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login Failed</Modal.Title>
      </Modal.Header>
      <Modal.Body className='text-danger'>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// PropType checking for ErrorModal
ErrorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default ErrorModal;
