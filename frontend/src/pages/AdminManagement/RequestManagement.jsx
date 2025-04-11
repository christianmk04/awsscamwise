import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Tabs, Tab, Alert, Accordion, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const RequestManagement = () => {
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Material/Pastel color palette - similar to the profile page for consistency
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

  // Custom CSS for the component
  const styles = {
    contentContainer: {
      backgroundColor: colors.background,
      minHeight: '100vh',
      padding: '20px 0'
    },
    pageHeader: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '25px 30px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      color: colors.textPrimary,
      fontWeight: '700',
      margin: 0
    },
    headerBadge: {
      backgroundColor: colors.accent,
      padding: '8px 16px',
      borderRadius: '20px',
      fontWeight: '600',
      fontSize: '0.9rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    tabContainer: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '25px 30px',
      marginBottom: '30px'
    },
    customTab: {
      fontWeight: '600',
      color: colors.textSecondary,
      padding: '12px 20px',
      borderRadius: '8px 8px 0 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    activeTab: {
      color: colors.primary,
      borderBottom: `3px solid ${colors.primary}`
    },
    itemsContainer: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '25px'
    },
    quizCard: {
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
    quizCardHeader: {
      backgroundColor: '#f8f9fa',
      padding: '15px 20px',
      borderBottom: `1px solid ${colors.tabBorder}`
    },
    quizCardTitle: {
      color: colors.textPrimary,
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    quizBadge: {
      padding: '5px 10px',
      borderRadius: '20px',
      fontWeight: '500',
      fontSize: '0.75rem'
    },
    quizBody: {
      padding: '20px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '30px'
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
    actionButton: {
      borderRadius: '30px',
      padding: '8px 20px',
      fontWeight: '500',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    acceptButton: {
      backgroundColor: colors.success,
      borderColor: colors.success,
      color: '#fff'
    },
    rejectButton: {
      backgroundColor: colors.error,
      borderColor: colors.error,
      color: '#fff'
    },
    emptyState: {
      backgroundColor: '#f8f9fa',
      padding: '40px 20px',
      borderRadius: '12px',
      textAlign: 'center',
      border: `1px dashed ${colors.tabBorder}`
    },
    emptyStateIcon: {
      fontSize: '60px',
      opacity: 0.6,
      margin: '0 auto 20px',
      display: 'block',
      color: colors.textSecondary
    },
    emptyStateText: {
      color: colors.textSecondary,
      fontSize: '1.1rem',
      maxWidth: '500px',
      margin: '0 auto'
    }
  };

  // Fetch pending quizzes on component mount
  useEffect(() => {
    const fetchPendingQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://18.214.76.26:5004/get_pending_quizzes');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setPendingQuizzes(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching pending quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingQuizzes();
  }, []);

  // Fetch quiz questions when a quiz is selected
  const fetchQuizQuestions = async (quizId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://18.214.76.26:5005/get_quiz_questions/${quizId}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const questions = await response.json();
      setQuizQuestions(questions);
      setShowQuizModal(true);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching quiz questions:', err);
      setNotification({
        show: true,
        message: `Failed to fetch quiz questions: ${err.message}`,
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz selection
  const handleQuizSelection = (quiz) => {
    setSelectedQuiz(quiz);
    fetchQuizQuestions(quiz.quizId);
  };

  // Handle accept or reject confirmation
  const handleConfirmAction = (action, quiz) => {
    setSelectedQuiz(quiz);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  // Execute the confirmed action (accept or reject)
  const executeAction = async () => {
    if (!selectedQuiz || !confirmAction) return;
    
    try {
      setLoading(true);
      
      const endpoint = confirmAction === 'accept' 
        ? `http://18.214.76.26:5004/accept_pending_quiz/${selectedQuiz.quizId}`
        : `http://18.214.76.26:5004/reject_pending_quiz/${selectedQuiz.quizId}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Remove the processed quiz from the list
      setPendingQuizzes(pendingQuizzes.filter(quiz => quiz.quizId !== selectedQuiz.quizId));
      
      // Show success notification
      setNotification({
        show: true,
        message: `Quiz ${confirmAction === 'accept' ? 'accepted' : 'rejected'} successfully!`,
        type: 'success'
      });
      
      // Close modals
      setShowConfirmModal(false);
      setShowQuizModal(false);
      
    } catch (err) {
      console.error(`Error ${confirmAction}ing quiz:`, err);
      setNotification({
        show: true,
        message: `Failed to ${confirmAction} quiz: ${err.message}`,
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return '#4caf50'; // green
      case 'medium': return '#ff9800'; // orange
      case 'hard': return '#f44336'; // red
      default: return colors.accent;
    }
  };

  if (loading && pendingQuizzes.length === 0) {
    return (
      <div style={styles.contentContainer}>
        <Container>
          <div style={styles.loadingContainer}>
            <DotLottieReact
              src="https://lottie.host/c4ebbe3c-45f7-4cbc-a483-0a4016d9d250/SHoYfui1im.lottie"
              loop
              autoplay
              style={{ maxWidth: '300px', marginBottom: '20px' }}
            />
            <h3 style={{ color: colors.primary, fontWeight: '600' }}>
              Loading Pending Requests...
            </h3>
          </div>
        </Container>
      </div>
    );
  }

  if (error && pendingQuizzes.length === 0) {
    return (
      <div style={styles.contentContainer}>
        <Container>
          <div style={styles.itemsContainer}>
            <Alert variant="danger">
              <h4>Error Loading Requests</h4>
              <p>{error}</p>
              <Button 
                variant="outline-danger" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={styles.contentContainer}>
      {/* Toast Notifications */}
      <ToastContainer 
        position="top-end" 
        className="p-3" 
        style={{ zIndex: 1060 }}
      >
        <Toast 
          show={notification.show} 
          onClose={() => setNotification({...notification, show: false})} 
          delay={5000} 
          autohide
          bg={notification.type}
        >
          <Toast.Header>
            <strong className="me-auto">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={notification.type === 'success' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Container>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h2 style={styles.headerTitle}>Content Request Management</h2>
          <div style={styles.headerBadge}>
            <span className="material-symbols-rounded">admin_panel_settings</span>
            Admin Console
          </div>
        </div>

        {/* Tabs Container */}
        <div style={styles.tabContainer}>
          <Tabs
            id="request-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab 
              eventKey="quizzes" 
              title={
                <div style={{
                  ...styles.customTab,
                  ...(activeTab === 'quizzes' ? styles.activeTab : {})
                }}>
                  <span className="material-symbols-rounded">quiz</span>
                  Pending Quizzes
                  {pendingQuizzes.length > 0 && (
                    <Badge 
                      bg="primary" 
                      pill
                      style={{ marginLeft: '5px' }}
                    >
                      {pendingQuizzes.length}
                    </Badge>
                  )}
                </div>
              }
            />
            <Tab 
              eventKey="scenarios" 
              title={
                <div style={{
                  ...styles.customTab,
                  ...(activeTab === 'scenarios' ? styles.activeTab : {})
                }}>
                  <span className="material-symbols-rounded">rebase_edit</span>
                  Pending Scenarios
                </div>
              }
            />
          </Tabs>

          {/* Tab Content */}
          {activeTab === 'quizzes' && (
            <div>
              <h4 style={{ marginBottom: '20px', fontWeight: '600' }}>
                <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                  pending_actions
                </span>
                Pending Quiz Approvals
              </h4>
              
              {pendingQuizzes.length === 0 ? (
                <div style={styles.emptyState}>
                  <span className="material-symbols-rounded" style={styles.emptyStateIcon}>task_alt</span>
                  <p style={styles.emptyStateText}>
                    No pending quizzes to review at the moment. All caught up!
                  </p>
                </div>
              ) : (
                <Row>
                  {pendingQuizzes.map((quiz) => (
                    <Col key={quiz.quizId} lg={6} className="mb-4">
                      <Card 
                        style={styles.quizCard}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Header style={styles.quizCardHeader}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 style={styles.quizCardTitle}>
                              <span className="material-symbols-rounded">quiz</span>
                              {quiz.quizName}
                            </h5>
                            <Badge 
                              style={{
                                ...styles.quizBadge,
                                backgroundColor: getDifficultyColor(quiz.difficulty)
                              }}
                            >
                              {quiz.difficulty}
                            </Badge>
                          </div>
                        </Card.Header>
                        <Card.Body style={styles.quizBody}>
                          <div className="mb-3">
                            <p className="mb-2"><strong>Topic:</strong> {quiz.topic}</p>
                            <p className="mb-2"><strong>Subtopic:</strong> {quiz.subtopic}</p>
                            <p className="mb-2"><strong>XP Points:</strong> {quiz.xp}</p>
                          </div>
                          
                          <div className="d-flex justify-content-between mt-3">
                            <Button 
                              style={{...styles.actionButton, ...styles.acceptButton}}
                              onClick={() => handleConfirmAction('accept', quiz)}
                            >
                              <span className="material-symbols-rounded">check_circle</span>
                              Accept
                            </Button>
                            <Button 
                              style={{...styles.actionButton, ...styles.rejectButton}}
                              onClick={() => handleConfirmAction('reject', quiz)}
                            >
                              <span className="material-symbols-rounded">cancel</span>
                              Reject
                            </Button>
                            <Button 
                              variant="outline-primary"
                              style={styles.actionButton}
                              onClick={() => handleQuizSelection(quiz)}
                            >
                              <span className="material-symbols-rounded">visibility</span>
                              Review
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}

          {activeTab === 'scenarios' && (

            <div>
                <h4 style={{ marginBottom: '20px', fontWeight: '600' }}>
                    <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                    pending_actions
                    </span>
                    Pending Scenario Approvals
                </h4>
            
                <div style={styles.emptyState}>
                <span className="material-symbols-rounded" style={styles.emptyStateIcon}>upcoming</span>
                <p style={styles.emptyStateText}>
                    Scenario approval system is coming soon. The endpoints will be created later.
                </p>
                </div>
            </div>
          )}
        </div>
      </Container>

      {/* Quiz Review Modal */}
      <Modal 
        show={showQuizModal} 
        onHide={() => setShowQuizModal(false)}
        size="lg"
        centered
      >
        {selectedQuiz && (
          <>
            <Modal.Header style={styles.modalHeader} closeButton>
              <Modal.Title style={styles.modalTitle}>
                <span className="material-symbols-rounded">quiz</span>
                {selectedQuiz.quizName}
                <Badge 
                  style={{
                    ...styles.modalBadge,
                    backgroundColor: getDifficultyColor(selectedQuiz.difficulty)
                  }}
                >
                  {selectedQuiz.difficulty}
                </Badge>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={styles.modalBody}>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <h6>Topic</h6>
                    <p className="text-muted">{selectedQuiz.topic}</p>
                  </div>
                  <div className="mb-3">
                    <h6>Subtopic</h6>
                    <p className="text-muted">{selectedQuiz.subtopic}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <h6>XP Reward</h6>
                    <p className="text-muted">{selectedQuiz.xp} points</p>
                  </div>
                  <div className="mb-3">
                    <h6>Status</h6>
                    <Badge bg="warning" style={{padding: '6px 10px', borderRadius: '8px'}}>
                      {selectedQuiz.status}
                    </Badge>
                  </div>
                </Col>
              </Row>
              
              <h5 className="mb-3" style={{fontWeight: '600'}}>Quiz Questions</h5>
              {quizQuestions.map((question, index) => (
                <Accordion key={question.questionId} className="mb-3">
                  <Accordion.Item style={styles.questionCard}>
                    <Accordion.Header style={styles.questionHeader}>
                      <div>
                        <Badge bg="primary" className="me-2">Q{index + 1}</Badge>
                        {question.question}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-4">
                        <h6>Answer Options</h6>
                        {Object.entries(question.choices).map(([key, value]) => (
                          <div 
                            key={key} 
                            style={{
                              ...styles.answerOption,
                              ...(key === question.correctAnswer ? styles.correctAnswer : {})
                            }}
                          >
                            <div 
                              style={{
                                ...styles.optionLabel,
                                ...(key === question.correctAnswer ? styles.correctLabel : {})
                              }}
                            >
                              {key.toUpperCase()}
                            </div>
                            <div>{value}</div>
                            {key === question.correctAnswer && (
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
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              ))}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button 
                style={{...styles.actionButton, ...styles.rejectButton}}
                onClick={() => {
                  setShowQuizModal(false);
                  handleConfirmAction('reject', selectedQuiz);
                }}
              >
                <span className="material-symbols-rounded">cancel</span>
                Reject Quiz
              </Button>
              <Button 
                style={{...styles.actionButton, ...styles.acceptButton}}
                onClick={() => {
                  setShowQuizModal(false);
                  handleConfirmAction('accept', selectedQuiz);
                }}
              >
                <span className="material-symbols-rounded">check_circle</span>
                Accept Quiz
              </Button>
            </Modal.Footer>
          </>
        )}
        {!selectedQuiz && (
          <Modal.Body>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading quiz details...</p>
            </div>
          </Modal.Body>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton style={{backgroundColor: confirmAction === 'accept' ? '#e8f5e9' : '#ffebee'}}>
          <Modal.Title>
            {confirmAction === 'accept' ? 'Accept Quiz' : 'Reject Quiz'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <span 
              className="material-symbols-rounded"
              style={{
                fontSize: '64px',
                color: confirmAction === 'accept' ? colors.success : colors.error
              }}
            >
              {confirmAction === 'accept' ? 'check_circle' : 'cancel'}
            </span>
          </div>
          
          <p className="text-center">
            Are you sure you want to {confirmAction} the quiz 
            <strong> &quot;{selectedQuiz?.quizName}&quot;</strong>?
          </p>
          
          <p className="text-center text-muted small">
            {confirmAction === 'accept' 
              ? 'This quiz will become available to all users.' 
              : 'This quiz will be removed from pending requests.'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant={confirmAction === 'accept' ? 'success' : 'danger'}
            onClick={executeAction}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              `Yes, ${confirmAction === 'accept' ? 'Accept' : 'Reject'}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RequestManagement;