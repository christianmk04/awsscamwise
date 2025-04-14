import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Modal, Image, Container, Card, Toast } from "react-bootstrap";

const UserSettings = () => {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [tempFile, setTempFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // RETRIEVE PROFILE FROM MICROSERVICE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get userId from local storage
        const userId = localStorage.getItem('userId');

        // Fetch profile data from microservice
        const response = await fetch(`http://0.0.0.0:5002/get_account_details/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        // Parse the response
        const data = await response.json();
              
        // Set profile data
        setFullName(data.fullName);
        setBio(data.about);
        setEmail(data.email);
        setProfilePicture(data.profilePicturePath);
      } catch (error) {
        showNotification("Error loading profile data" + error, "danger");
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = (field) => {
    setFieldToEdit(field);
    if (field === "profilePicture") {
      setTempFile(null);
    } else {
      setTempValue(
        field === "password" ? "" : field === "fullName" ? fullName : field === "bio" ? bio : email
      );
    }
    setShowModal(true);
  };

  const showNotification = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const userId = localStorage.getItem('userId');
    
    try {
      if (fieldToEdit === "fullName") {
        // Update full name
        const response = await fetch("http://0.0.0.0:5002/update_full_name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, fullName: tempValue }),
        });

        if (!response.ok) {
          throw new Error("Failed to update name");
        }

        setFullName(tempValue);
        showNotification("Full name updated successfully");
      } 
      else if (fieldToEdit === "bio") {
        // Update bio
        const response = await fetch("http://0.0.0.0:5002/update_bio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, bio: tempValue }),
        });

        if (!response.ok) {
          throw new Error("Failed to update bio");
        }

        setBio(tempValue);
        showNotification("Bio updated successfully");
      } 
      else if (fieldToEdit === "email") {
        // Just update locally for now, as you didn't specify an endpoint for email
        setEmail(tempValue);
        showNotification("Email updated successfully");
      } 
      else if (fieldToEdit === "profilePicture" && tempFile) {
        // Update profile picture
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('profilePicture', tempFile);

        const response = await fetch("http://0.0.0.0:5002/update_profile_picture", {
          method: "POST",
          body: formData, // No Content-Type header for FormData
        });

        if (!response.ok) {
          throw new Error("Failed to update profile picture");
        }

        const data = await response.json();
        setProfilePicture(data.profilePicturePath || URL.createObjectURL(tempFile));
        showNotification("Profile picture updated successfully");
        // Refresh the page to see the updated profile picture
        window.location.reload();
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "danger");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">Profile Settings</h3>
        </Card.Header>
        <Card.Body className="p-4">
          {/* Profile Information Section */}
          <div className="d-flex flex-column flex-md-row mb-4 align-items-center">
            <div className="text-center mb-3 mb-md-0 me-md-4">
              <Image 
                src={profilePicture || '/default-profile.png'} 
                roundedCircle 
                className="border shadow-sm" 
                width={120} 
                height={120} 
                style={{ objectFit: 'cover' }}
                alt="Profile" 
              />
              <div className="mt-2">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => handleEdit("profilePicture")}
                >
                  Change Picture
                </Button>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <h4 className="mb-1">{fullName}</h4>
              <p className="text-muted mb-2">{email}</p>
              <p className="mb-0">{bio || "No bio added yet."}</p>
            </div>
          </div>

          <hr className="my-4" />

          {/* Profile Details Section */}
          <div className="settings-list">
            {/* Full Name */}
            <Row className="p-3 mb-2 align-items-center rounded hover-bg">
              <Col xs={12} md={3}>
                <strong>Full Name</strong>
              </Col>
              <Col xs={12} md={7} className="text-break">
                {fullName}
              </Col>
              <Col xs={12} md={2} className="text-md-end mt-2 mt-md-0">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => handleEdit("fullName")}
                >
                  Edit
                </Button>
              </Col>
            </Row>

            {/* About Me / Bio */}
            <Row className="p-3 mb-2 align-items-center rounded hover-bg">
              <Col xs={12} md={3}>
                <strong>About Me</strong>
              </Col>
              <Col xs={12} md={7} className="text-break">
                {bio || <span className="text-muted fst-italic">No information provided</span>}
              </Col>
              <Col xs={12} md={2} className="text-md-end mt-2 mt-md-0">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => handleEdit("bio")}
                >
                  Edit
                </Button>
              </Col>
            </Row>

            {/* Email */}
            <Row className="p-3 mb-2 align-items-center rounded hover-bg">
              <Col xs={12} md={3}>
                <strong>Email</strong>
              </Col>
              <Col xs={12} md={7} className="text-break">
                {email}
              </Col>
              <Col xs={12} md={2} className="text-md-end mt-2 mt-md-0">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => handleEdit("email")}
                >
                  Edit
                </Button>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Modal for Editing */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Edit {fieldToEdit.charAt(0).toUpperCase() + fieldToEdit.slice(1)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              {fieldToEdit === "profilePicture" ? (
                <>
                  <Form.Label>Select a new profile picture</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTempFile(e.target.files[0])}
                  />
                  {tempFile && (
                    <div className="mt-3 text-center">
                      <Image 
                        src={URL.createObjectURL(tempFile)} 
                        roundedCircle 
                        width={100} 
                        height={100} 
                        alt="Preview" 
                        className="border"
                      />
                    </div>
                  )}
                </>
              ) : fieldToEdit === "bio" ? (
                <>
                  <Form.Label>About Me</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Tell us about yourself"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Form.Label>{fieldToEdit.charAt(0).toUpperCase() + fieldToEdit.slice(1)}</Form.Label>
                  <Form.Control
                    type={fieldToEdit === "password" ? "password" : "text"}
                    placeholder={`Enter new ${fieldToEdit}`}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                </>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1050 }}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
          text={toastVariant === "danger" ? "white" : ""}
        >
          <Toast.Header>
            <strong className="me-auto">Profile Update</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </div>
    </Container>
  );
};

export default UserSettings;