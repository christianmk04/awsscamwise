import { useState } from 'react';
import { Card, Button, Badge, Row, Col, Modal, Spinner } from "react-bootstrap";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const QuizCard = ({ quiz, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Material/Pastel color palette - matching RequestManagement component
  const colors = {
    primary: '#6200ee',    // Deep purple
    secondary: '#03dac6',  // Teal
    background: '#f5f7fa', // Light gray background
    surface: '#ffffff',    // White surface
    accent: '#bb86fc',     // Light purple
    error: '#b00020',      // Error red
    success: '#4caf50',    // Success green
    warning: '#ff9800',    // Warning orange
    textPrimary: '#333333',
    textSecondary: '#757575',
    cardBg: '#ffffff',
    navActiveBg: '#ede7f6', // Light purple background for active nav
    navActiveText: '#6200ee',
    tabBorder: '#e0e0e0',  // Light gray border
    buttonHover: '#5000d6', // Darker purple for hover
  };

  // Custom CSS styles matching RequestManagement
  const styles = {
    quizCard: {
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      marginBottom: '20px',
      overflow: 'hidden',
      borderLeft: `4px solid ${colors.accent}`
    },
    hoverCard: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
    },
    cardHeader: {
      backgroundColor: '#f8f9fa',
      padding: '15px 20px',
      borderBottom: `1px solid ${colors.tabBorder}`
    },
    cardTitle: {
      color: colors.primary,
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    cardBody: {
      padding: '20px'
    },
    badge: {
      padding: '5px 12px',
      borderRadius: '20px',
      fontWeight: '500',
      fontSize: '0.8rem',
      marginRight: '8px'
    },
    actionButton: {
      borderRadius: '30px',
      padding: '8px 20px',
      fontWeight: '500',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginRight: '10px',
      marginBottom: '10px'
    },
    viewButton: {
      backgroundColor: '#e3f2fd',
      borderColor: '#2196f3',
      color: '#2196f3'
    },
    editButton: {
      backgroundColor: colors.navActiveBg,
      borderColor: colors.primary,
      color: colors.primary
    },
    deleteButton: {
      backgroundColor: '#ffebee',
      borderColor: colors.error,
      color: colors.error
    },
    statBadge: {
      backgroundColor: '#f8f9fa',
      color: colors.textSecondary,
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    },
    modalHeader: {
      backgroundColor: '#f8f9fa',
      borderBottom: `1px solid ${colors.tabBorder}`,
      paddingBottom: '15px'
    },
    modalTitle: {
      color: colors.textPrimary,
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    modalBadge: {
      backgroundColor: colors.accent,
      color: '#fff',
      padding: '5px 12px',
      borderRadius: '20px',
      fontWeight: '500',
      fontSize: '0.8rem'
    },
    modalBody: {
      padding: '20px',
      maxHeight: '70vh',
      overflowY: 'auto'
    },
    questionCard: {
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      marginBottom: '20px',
      border: 'none'
    },
    questionHeader: {
      backgroundColor: colors.navActiveBg,
      padding: '15px 20px',
      borderRadius: '12px 12px 0 0',
      borderBottom: 'none'
    },
    questionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: colors.textPrimary,
      margin: 0
    },
    answerOption: {
      padding: '10px 15px',
      borderRadius: '8px',
      marginBottom: '10px',
      backgroundColor: '#f8f9fa',
      border: `1px solid ${colors.tabBorder}`,
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start'
    },
    correctAnswer: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderColor: colors.success
    },
    optionLabel: {
      fontWeight: '600',
      backgroundColor: colors.accent,
      color: 'white',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      flexShrink: 0
    },
    correctLabel: {
      backgroundColor: colors.success
    },
    feedbackSection: {
      padding: '15px',
      marginTop: '15px',
      borderRadius: '8px',
      backgroundColor: '#f0f8ff',
      borderLeft: `4px solid ${colors.accent}`
    },
    statContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '15px 0 0',
      borderTop: `1px solid ${colors.tabBorder}`,
      marginTop: '15px'
    }
  };

  // Determine difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "success"; // Green
      case "intermediate":
        return "warning"; // Yellow/Orange
      case "advanced":
        return "danger"; // Red
      default:
        return "secondary"; // Default accent
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "success"; // Green
      case "pending":
        return "warning"; // Yellow/Orange
      case "rejected":
        return "danger"; // Red
      default:
        return "secondary"; // Default accent
    }
  };

  const fetchQuizQuestions = async (quizId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://0.0.0.0:5005/get_quiz_questions/${quizId}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const questions = await response.json();
      setQuizQuestions(questions);
      setShowQuestionsModal(true);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching quiz questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle delete quiz
  const handleDeleteQuiz = async () => {
    setShowDeleteModal(true);
    setDeleteStatus("loading");

    try {
      const response = await fetch(`http://0.0.0.0:5004/delete_quiz/${quiz.quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      setDeleteStatus("success");

      setTimeout(() => {
        setShowDeleteModal(false);
        onDelete(quiz.quizId); // Remove quiz from UI
      }, 2000);
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      setDeleteStatus("error");
    }
  };

  const handleEditClick = () => {
    // Navigate and pass quizId as state
    navigate(`/quiz-master/edit-quiz`, { state: { quizId: quiz.quizId } });
  };

  return (
    <>
      <Card 
        style={styles.quizCard}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Card.Header style={styles.cardHeader}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 style={styles.cardTitle}>
              <span className="material-symbols-rounded">quiz</span>
              {quiz.quizName}
            </h5>
            <div>
              <Badge 
                bg={getDifficultyColor(quiz.difficulty)}
                style={{
                  ...styles.badge,
                  color: quiz.difficulty.toLowerCase() == 'intermediate' ? '#000' : '#fff'
                }}
              >
                {quiz.difficulty}
              </Badge>
              <Badge 
                bg={getStatusColor(quiz.status)}
                style={{
                  ...styles.badge,
                  color: quiz.status.toLowerCase() == 'pending' ? '#000' : '#fff'
                }}
              >
                {quiz.status}
              </Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body style={styles.cardBody}>
          <Row>
            <Col md={5}>
              <div className="mb-3">
                <p className="mb-2"><strong>Topic:</strong> {quiz.topic}</p>
                <p className="mb-2"><strong>Subtopic:</strong> {quiz.subtopic}</p>
                <p className="mb-2"><strong>Questions:</strong> {quiz.numQuestions}</p>
                <p className="mb-2"><strong>Created:</strong> {new Date(quiz.createdDate).toLocaleDateString()}</p>
              </div>
            </Col>
            <Col md={7} className="d-flex flex-wrap justify-content-md-end align-items-start mt-3 mt-md-0">
              <Button 
                variant="outline-info"
                style={{...styles.actionButton, ...styles.viewButton}}
                onClick={(e) => {
                  e.stopPropagation();
                  fetchQuizQuestions(quiz.quizId);
                }}
              >
                <span className="material-symbols-rounded">visibility</span>
                View Questions
              </Button>

              {quiz.status !== "rejected" && (
                <>
                  <Button 
                    variant="outline-primary"
                    style={{...styles.actionButton, ...styles.editButton}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick();
                    }}
                  >
                    <span className="material-symbols-rounded">edit</span>
                    Edit
                  </Button>

                  <Button 
                    variant="outline-danger"
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuiz();
                    }}
                  >
                    <span className="material-symbols-rounded">delete</span>
                    Delete
                  </Button>
                </>
              )}
            </Col>
          </Row>

          <div style={styles.statContainer}>
            <div style={styles.statBadge}>
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>star</span>
              <span><strong>Rating:</strong> {quiz.averageRating}/5</span>
            </div>
            <div style={styles.statBadge}>
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>people</span>
              <span><strong>Attempts:</strong> {quiz.totalAttempts}</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Modal */}
      <Modal 
        show={showDeleteModal} 
        centered 
        onHide={() => setShowDeleteModal(false)}
        size="sm"
      >
        <Modal.Body className="text-center" style={{ padding: '30px' }}>
          {deleteStatus == "loading" && (
            <>
              <DotLottieReact
                src="https://lottie.host/4f54200f-e7da-4c5c-99a5-7e9e48ddf16d/HF8w5HaIeq.lottie"
                loop autoplay
                style={{ width: '180px', height: '180px', margin: '0 auto 20px' }}
              />
              <h4 style={{ color: colors.primary, fontWeight: '600' }}>Deleting Quiz...</h4>
            </>
          )}
          {deleteStatus == "success" && (
            <>
              <DotLottieReact
                src="https://lottie.host/84f52346-0c0b-4fe8-a310-bdf024ef7fee/lyAlxYpVuS.lottie"
                loop={false} autoplay
                style={{ width: '180px', height: '180px', margin: '0 auto 20px' }}
              />
              <h4 style={{ color: colors.success, fontWeight: '600' }}>Quiz Deleted Successfully!</h4>
            </>
          )}
          {deleteStatus == "error" && (
            <>  
              <DotLottieReact
                src="https://lottie.host/5397a6a8-8f8d-49ae-920d-f2250a9888e6/0lwvzMAkbg.lottie"
                loop={false} autoplay
                style={{ width: '180px', height: '180px', margin: '0 auto 20px' }}
              />
              <h4 style={{ color: colors.error, fontWeight: '600' }}>Failed to Delete Quiz</h4>
              <p className="text-muted">Please try again later.</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Questions Modal */}
      <Modal 
        show={showQuestionsModal} 
        onHide={() => setShowQuestionsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={styles.modalTitle}>
            <span className="material-symbols-rounded">quiz</span>
            {quiz.quizName}
            {/* bg depending on getDifficultyColor */}
            <Badge 
                bg={getDifficultyColor(quiz.difficulty)}
                style={{
                ...styles.modalBadge,
                backgroundColor: getDifficultyColor(quiz.difficulty),
                color: quiz.difficulty.toLowerCase() == 'intermediate' ? '#000' : '#fff'
              }}
            >
              {quiz.difficulty}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '60px 0' 
            }}>
              <Spinner animation="border" style={{ color: colors.primary }} />
              <p className="mt-3">Loading quiz questions...</p>
            </div>
          ) : (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <h6>Topic</h6>
                    <p className="text-muted">{quiz.topic}</p>
                  </div>
                  <div className="mb-3">
                    <h6>Subtopic</h6>
                    <p className="text-muted">{quiz.subtopic}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <h6>Status</h6>
                    <Badge 
                      style={{
                        padding: '6px 10px', 
                        borderRadius: '8px',
                        backgroundColor: getStatusColor(quiz.status),
                        color: quiz.status.toLowerCase() == 'pending' ? '#000' : '#fff'
                      }}
                    >
                      {quiz.status}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <h6>Created</h6>
                    <p className="text-muted">{new Date(quiz.createdDate).toLocaleDateString()}</p>
                  </div>
                </Col>
              </Row>
              
              <h5 className="mb-3" style={{ fontWeight: '600' }}>
                Quiz Questions
              </h5>
              
              {quizQuestions.map((question, index) => (
                <div key={question.questionId} style={styles.questionCard}>
                  <div style={styles.questionHeader}>
                    <div style={styles.questionTitle}>
                      <Badge bg="primary" className="me-2">Q{index + 1}</Badge>
                      {question.question}
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div className="mb-4">
                      <h6>Answer Options</h6>
                      {Object.entries(question.choices).map(([key, value]) => (
                        <div 
                          key={key} 
                          style={{
                            ...styles.answerOption,
                            ...(key == question.correctAnswer ? styles.correctAnswer : {})
                          }}
                        >
                          <div 
                            style={{
                              ...styles.optionLabel,
                              ...(key == question.correctAnswer ? styles.correctLabel : {})
                            }}
                          >
                            {key.toUpperCase()}
                          </div>
                          <div>{value}</div>
                          {key == question.correctAnswer && (
                            <Badge bg="success" className="ms-auto">Correct</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-3">
                      <h6>Hint</h6>
                      <p className="text-muted">{question.hint}</p>
                    </div>
                    
                    <div style={styles.feedbackSection}>
                      <h6>Feedback to User</h6>
                      <div className="mb-2">
                        <strong>For Correct Answer:</strong>
                        <p className="mb-0">{question.correctFeedback}</p>
                      </div>
                      <div>
                        <strong>For Wrong Answer:</strong>
                        <p className="mb-0">{question.wrongFeedback}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            style={styles.actionButton}
            onClick={() => setShowQuestionsModal(false)}
          >
            <span className="material-symbols-rounded">close</span>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuizCard;

// Prop Validation
QuizCard.propTypes = {
  quiz: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired
};