import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col, Modal } from 'react-bootstrap';

const FirstTimeDetails = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fullName, setFullName] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profilePicture || !fullName || !about) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('profilePicture', profilePicture);
    formData.append('base64Image', preview);
    formData.append('fullName', fullName);
    formData.append('about', about);

    try {

      // extract userId from local storage
      const userId = localStorage.getItem('userId');

      const response = await fetch('http://172.31.17.239:5002/first_time_details/' + userId, {
        method: 'POST',
        body: formData,
      });

      setLoading(false);

      if (response.ok) {

        navigate('/home'); // Redirect to the user's profile page
      } else {
        console.error('Server error:', response.status);

        if (response.status === 413) {
          alert('The image is too large. Please upload an image less than 1MB.');
        }
        else{
          alert('Failed to update user details. Please try again.');
        }
      }
    } catch (error) {
      setLoading(false);
      
      // If error code is 413, alert the user that the image is too large
      if (error.response.status === 413) {
        alert('The image is too large. Please upload an image less than 1MB.');
      } else {
        console.error('Error:', error);
        alert('Failed to update user details. Please try again.');
      }
    }
  };

  const isFormComplete = profilePicture && fullName && about;

  return (
    <>
      <Modal show={loading} centered>
        <Modal.Body className="text-center">
          <p>Submitting your details, please wait...</p>
        </Modal.Body>
      </Modal>

      <div className="page-wrapper" style={{ backgroundColor: '#13072e' }}>
        <Container fluid className="p-0 w-50 w-md-75">
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs={12} md={10} lg={8} xl={8}>
              <div className="form-container p-4 rounded shadow text-white">
                <div className="logo-container mx-auto d-block text-center mb-5">
                  <img
                    src="logo.png"
                    alt="ScamWise Logo"
                    className="logo-image img-fluid"
                  />
                  <div className="border border-light"></div>
                </div>

                <h3 className="text-center mb-4">Complete Your Profile</h3>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="formProfilePicture">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="rounded-pill px-3 py-2"
                      required
                    />
                  </Form.Group>

                  {preview && (
                    <div className="text-center mb-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <Form.Group className="mb-4" controlId="formFullName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-pill px-3 py-2"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formAbout">
                    <Form.Label>About</Form.Label>
                    <Form.Control
                      as="textarea"
                      placeholder="Tell us something about yourself"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={4}
                      className="rounded px-3 py-2"
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 rounded-pill"
                    disabled={!isFormComplete}
                  >
                    Submit
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default FirstTimeDetails;
