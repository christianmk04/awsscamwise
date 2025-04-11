import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useNavigate, useLocation } from 'react-router-dom'

// Custom color palette (same as CreateCustomQuiz)
const colors = {
  primary: '#6a5acd', // Slate blue
  secondary: '#ffc8dd', // Pastel pink
  accent: '#a2d2ff', // Light blue
  success: '#b5e48c', // Pastel green
  warning: '#ffd166', // Pastel yellow
  danger: '#ff758f', // Pastel red
  light: '#f8f9fa',
  dark: '#495057',
  background: '#f9f7fe', // Light lavender background
}

const EditCustomQuiz = () => {
  const [mainTopicsArray, setMainTopicsArray] = useState([]);
  const [subTopicsArray, setSubTopicsArray] = useState({});
  const [mainTopic, setMainTopic] = useState("");
  const [subTopic, setSubTopic] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [quizName, setQuizName] = useState("");
  const [customMainTopic, setCustomMainTopic] = useState("");
  const [customSubTopic, setCustomSubTopic] = useState("");
  const [questions, setQuestions] = useState(
    Array.from({ length: 4 }, (_, i) => ({
      question: "",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      hint: "",
      correctOption: null,
      correctFeedback: "",
      wrongFeedback: "",
    }))
  );
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("loading");
  const [activeSection, setActiveSection] = useState("quizInfo"); // "quizInfo" or "questions"
  const { state } = useLocation(); // Access the quizId passed from QuizCard
  const navigate = useNavigate();
  
  // New state for custom alert modal (same as CreateCustomQuiz)
  const [alertModalShow, setAlertModalShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("warning"); // warning, error, info

  // Custom alert function to replace all alerts (same as CreateCustomQuiz)
  const showAlert = (message, type = "warning") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalShow(true);
  };

  const addQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        question: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "",
        correctOption: null,
        correctFeedback: "",
        wrongFeedback: "",
      },
    ]);
  };

  const deleteQuestion = (index) => {
    if (questions.length <= 4) {
      showAlert("Cannot delete any more questions. The quiz must have at least 4 questions.");
      return;
    }
    setQuestions((prevQuestions) => {
      const updatedQuestions = prevQuestions.filter((_, i) => i !== index);
      return updatedQuestions.map((q, i) => ({ ...q }));
    });
  };

  useEffect(() => {
    const loadQuizData = async () => {
      const quizId = state?.quizId;
      if (!quizId) {
        console.warn('No quiz ID provided');
        showAlert('No quiz ID provided. Redirecting to profile page.', 'error');
        // Redirect back to profile page
        setTimeout(() => navigate('/profile'), 2000);
        return;
      }

      try {
        // Fetch topics (similar to CreateCustomQuiz)
        const topicEndpoint = 'http://18.214.76.26:5004/get_topics';
        const topicsResponse = await fetch(topicEndpoint);
        if (topicsResponse.ok) {
          const data = await topicsResponse.json();
          const mainTopics = Object.keys(data);
          mainTopics.push("Other (Create a New Topic)");

          const subTopics = {};
          for (const mainTopic of mainTopics) {
            subTopics[mainTopic] = data[mainTopic];
          }

          setMainTopicsArray(mainTopics);
          setSubTopicsArray(subTopics);
        }
        
        // Fetch quiz details
        const detailsResponse = await fetch(`http://18.214.76.26:5004/get_quiz_details/${quizId}`);
        
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch quiz details');
        }
        
        const quizDetails = await detailsResponse.json();

        // Update form fields with quiz details
        setQuizName(quizDetails.quizName);
        setMainTopic(quizDetails.topic);
        setSubTopic(quizDetails.subtopic);
        setDifficultyLevel(quizDetails.difficulty);

        // Fetch quiz questions
        const questionsResponse = await fetch(`http://18.214.76.26:5005/get_quiz_questions/${quizId}`);

        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch quiz questions');
        }

        const quizQuestions = await questionsResponse.json();
        
        // Transform API questions format to match component's state structure
        const formattedQuestions = quizQuestions.map(q => ({
          questionId: q.questionId,
          question: q.question,
          options: [q.choices.a, q.choices.b, q.choices.c, q.choices.d],
          hint: q.hint,
          correctOption: ['a', 'b', 'c', 'd'].indexOf(q.correctAnswer),
          correctFeedback: q.correctFeedback,
          wrongFeedback: q.wrongFeedback,
        }));

        setQuestions(formattedQuestions);

      } catch (error) {
        console.error('Error loading quiz data:', error);
        showAlert(`Error loading quiz data: ${error.message}`, 'error');
      }
    };

    loadQuizData();
  }, [navigate, state]);

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index][field] = value;
      return updatedQuestions;
    });
  };

  const setCorrectOption = (questionIndex, optionIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].correctOption = optionIndex;
      return updatedQuestions;
    });
  };

  const resetForm = () => {
    // Reset to original data - would need to re-fetch from server
    showAlert("This will reset all your changes. Are you sure?", "warning");
    // You might want to add a confirmation dialog here
  };

  const validateQuizInfo = () => {
    if (!quizName || !difficultyLevel) {
      showAlert("Please fill in all required fields before proceeding.");
      return false;
    }
  
    // Validate main topic and subtopic based on selection
    if (mainTopic === "Other (Create a New Topic)") {
      if (!customMainTopic.trim() || !customSubTopic.trim()) {
        showAlert("Please fill in the custom main topic and sub topic before proceeding.");
        return false;
      }
    } else {
      if (!mainTopic || !subTopic) {
        showAlert("Please select a main topic and sub topic before proceeding.");
        return false;
      }
    }
    return true;
  };

  const validateForm = () => {
    if (!validateQuizInfo()) return false;
  
    // Validate each question
    for (const question of questions) {
      if (!question.question.trim() ||
          question.options.some(opt => !opt.trim()) ||
          question.correctOption === null ||
          !question.correctFeedback.trim() ||
          !question.wrongFeedback.trim()) {
        showAlert("All questions must be completely filled before submitting.");
        return false;
      }
    }
    return true;
  };

  const handleContinueToQuestions = () => {
    if (validateQuizInfo()) {
      setActiveSection("questions");
      // Smooth scroll to the top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToQuizInfo = () => {
    setActiveSection("quizInfo");
    // Smooth scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setShowSubmissionModal(true);
    setSubmissionStatus("loading");

    const formattedQuestions = questions.map((q) => ({
      question_id: q.questionId,
      question: q.question,
      choices: {
        a: q.options[0],
        b: q.options[1],
        c: q.options[2],
        d: q.options[3],
      },
      correctAnswer: ["a", "b", "c", "d"][q.correctOption],
      hint: q.hint,
      correctFeedback: q.correctFeedback,
      wrongFeedback: q.wrongFeedback,
    }));

    // Determine the values for main_topic and sub_topic
    const selectedMainTopic = mainTopic === "Other (Create a New Topic)" ? customMainTopic : mainTopic;
    const selectedSubTopic = mainTopic === "Other (Create a New Topic)" ? customSubTopic : subTopic;
    
    const payload = {
      quiz_id: state.quizId,
      main_topic: selectedMainTopic,
      sub_topic: selectedSubTopic,
      difficulty: difficultyLevel,
      quiz_name: quizName,
      questions: formattedQuestions,
    };

    try {
      const response = await fetch("http://18.214.76.26:5004/edit_quiz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit quiz");
      setSubmissionStatus("success");
      setTimeout(() => navigate("/quiz-master"), 3000);

    } catch (error) {
      showAlert("Error submitting quiz: " + error.message, "error");
      setShowSubmissionModal(false);
    }
  };

  // Custom form styling (same as CreateCustomQuiz)
  const formStyles = {
    formContainer: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '2rem',
      marginTop: '2rem',
      marginBottom: '3rem',
      transition: 'all 0.3s ease',
    },
    formLabel: {
      fontWeight: '600',
      color: colors.dark,
    },
    formControl: {
      borderRadius: '8px',
      border: `1px solid ${colors.secondary}`,
      padding: '0.7rem',
      transition: 'all 0.2s',
    },
    select: {
      borderRadius: '8px',
      border: `1px solid ${colors.secondary}`,
      padding: '0.7rem',
      transition: 'all 0.2s',
    },
    button: {
      borderRadius: '8px',
      padding: '0.6rem 1.5rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
      color: colors.dark,
    },
    dangerButton: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      color: 'white',
    },
    questionCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: `1px solid ${colors.accent}`,
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    },
    correctOption: {
      backgroundColor: colors.success + '50', // Add transparency
      borderColor: colors.success,
    },
    sectionHeader: {
      padding: '1rem',
      borderRadius: '8px',
      backgroundColor: colors.accent + '30',
      marginBottom: '1.5rem',
      borderLeft: `5px solid ${colors.primary}`,
    },
    pageTabs: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
    },
    tab: {
      padding: '1rem 2rem',
      margin: '0 0.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s',
    },
    activeTab: {
      backgroundColor: colors.primary,
      color: 'white',
    },
    inactiveTab: {
      backgroundColor: colors.light,
      color: colors.dark,
    },
    progressBar: {
      height: '8px',
      backgroundColor: colors.light,
      borderRadius: '4px',
      marginBottom: '2rem',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    // New styles for custom alert modal
    alertModal: {
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    },
    alertModalHeader: {
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: 'none',
    },
    alertModalBody: {
      padding: '0 2rem 1.5rem',
      textAlign: 'center',
    },
    alertModalFooter: {
      borderTop: 'none',
      justifyContent: 'center',
      padding: '1rem 2rem 2rem',
    },
    disabledField: {
      backgroundColor: colors.light,
      opacity: 0.8,
    }
  };

  // Color styles for alert types (same as CreateCustomQuiz)
  const alertStyles = {
    warning: {
      iconColor: colors.warning,
      title: 'Warning',
      borderColor: colors.warning,
      animation: 'https://lottie.host/f9f2d8a9-3e69-452d-9181-e61ee99f4b45/MkFSYIWphs.lottie'
    },
    error: {
      iconColor: colors.danger,
      title: 'Error',
      borderColor: colors.danger,
      animation: 'https://lottie.host/a3b0a05e-9475-4b9b-b4cb-9e226768b121/JZkgyaxI1i.lottie'
    },
    info: {
      iconColor: colors.accent,
      title: 'Information',
      borderColor: colors.accent,
      animation: 'https://lottie.host/fe0cda0c-b5b3-4295-b073-804f5f5da97f/GISRI0usjB.lottie'
    }
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className="content-container p-3 p-md-5">
        <Container fluid className="welcome-container mx-auto">
          <Row className="align-items-center">
            <Col xl={1}></Col>
            <Col xl={5} className='d-flex flex-column justify-content-center'>
              <h1 className='fw-bold mb-4' style={{ color: colors.primary }}>Edit Your Custom Quiz!</h1>
              <h6 style={{ color: colors.dark, lineHeight: '1.6' }}>
                Update your quiz and help build a collective understanding of online security. 
                Your contributions to the ScamWise community are valuable in educating others about cybersecurity.
              </h6>
            </Col>
            <Col xl={5}>
              <DotLottieReact
                src="https://lottie.host/2ff32886-47f5-494c-8fdf-e543b08d2f1e/Jmk0lBMiWa.lottie"
                loop
                autoplay
                className="w-100 h-auto mx-auto"
              />
            </Col>
            <Col xl={1}></Col>
          </Row>
        </Container>
        
        {/* Progress Tracker */}
        <Container fluid className="mx-auto mt-4">
          <div style={formStyles.progressBar}>
            <div 
              style={{
                ...formStyles.progressFill,
                width: activeSection === "quizInfo" ? "50%" : "100%"
              }}
            ></div>
          </div>
          <div style={formStyles.pageTabs}>
            <div
              style={{
                ...formStyles.tab,
                ...(activeSection === "quizInfo" ? formStyles.activeTab : formStyles.inactiveTab)
              }}
              onClick={() => setActiveSection("quizInfo")}
            >
              1. Quiz Information
            </div>
            <div
              style={{
                ...formStyles.tab,
                ...(activeSection === "questions" ? formStyles.activeTab : formStyles.inactiveTab)
              }}
              onClick={() => validateQuizInfo() && setActiveSection("questions")}
            >
              2. Edit Questions
            </div>
          </div>
        </Container>
        
        <Container fluid style={formStyles.formContainer} className="mx-auto">
          <Form onSubmit={handleSubmit}>
            {activeSection === "quizInfo" && (
              <>
                <div style={formStyles.sectionHeader}>
                  <h4 style={{ color: colors.primary, margin: 0 }}>Quiz Information</h4>
                </div>
                
                <Form.Group as={Row} className="mb-4">
                  <Form.Label column sm={3} style={formStyles.formLabel}>
                    Quiz Name
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      placeholder="Enter the name of the quiz"
                      value={quizName}
                      disabled
                      style={{...formStyles.formControl, ...formStyles.disabledField}}
                    />
                  </Col>
                </Form.Group>

                {/* Main Topic Field */}
                <Form.Group as={Row} className="mb-4">
                  <Form.Label column sm={3} style={formStyles.formLabel}>
                    Main Topic
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      value={mainTopic}
                      disabled
                      style={{...formStyles.formControl, ...formStyles.disabledField}}
                    />
                  </Col>
                </Form.Group>
                
                {/* Sub Topic Field */}
                <Form.Group as={Row} className="mb-4">
                  <Form.Label column sm={3} style={formStyles.formLabel}>
                    Sub Topic
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      value={subTopic}
                      disabled
                      style={{...formStyles.formControl, ...formStyles.disabledField}}
                    />
                  </Col>
                </Form.Group>
                
                {/* Difficulty Level Field */}
                <Form.Group as={Row} className="mb-4">
                  <Form.Label column sm={3} style={formStyles.formLabel}>
                    Difficulty Level
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      value={difficultyLevel}
                      disabled
                      style={{...formStyles.formControl, ...formStyles.disabledField}}
                    />
                  </Col>
                </Form.Group>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button 
                    style={{...formStyles.button, ...formStyles.primaryButton}}
                    onClick={handleContinueToQuestions}
                  >
                    Continue to Questions
                  </Button>
                </div>
              </>
            )}

            {activeSection === "questions" && (
              <>
                <div style={formStyles.sectionHeader}>
                  <h4 style={{ color: colors.primary, margin: 0 }}>Edit Questions</h4>
                </div>
                
                {/* Questions Section */}
                {questions.map((question, index) => (
                  <div key={index} style={formStyles.questionCard}>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                      <h4 style={{ color: colors.primary, margin: 0 }}>Question {index + 1}</h4>
                      <div>
                        <Button 
                          style={{...formStyles.button, ...formStyles.dangerButton}}
                          className='mx-2' 
                          onClick={() => deleteQuestion(index)}
                        >
                          Delete
                        </Button>
                        <Button 
                          style={{...formStyles.button, ...formStyles.primaryButton}}
                          onClick={addQuestion}
                        >
                          Add Question
                        </Button>
                      </div>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label style={formStyles.formLabel}>Question:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Type your question here"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                        style={formStyles.formControl}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label style={formStyles.formLabel}>Question Options:</Form.Label>
                      {question.options.map((option, optIndex) => (
                        <InputGroup key={optIndex} className="mb-2">
                          <div className="input-group-text" style={{ background: 'none', border: 'none' }}>
                            <Form.Check
                              type="radio"
                              checked={question.correctOption === optIndex}
                              onChange={() => setCorrectOption(index, optIndex)}
                            />
                          </div>
                          <Form.Control
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            style={{
                              ...formStyles.formControl,
                              ...(question.correctOption === optIndex ? formStyles.correctOption : {})
                            }}
                            onChange={(e) => {
                              const updatedOptions = [...question.options];
                              updatedOptions[optIndex] = e.target.value;
                              handleQuestionChange(index, "options", updatedOptions);
                            }}
                          />
                        </InputGroup>
                      ))}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label style={formStyles.formLabel}>
                        Hint (Optional)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Type out question hint if any..."
                        value={question.hint}
                        onChange={(e) => handleQuestionChange(index, "hint", e.target.value)}
                        style={formStyles.formControl}
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={formStyles.formLabel}>Correct Feedback:</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder='Type out feedback for correct answer...'
                            value={question.correctFeedback}
                            onChange={(e) => handleQuestionChange(index, "correctFeedback", e.target.value)}
                            style={formStyles.formControl}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={formStyles.formLabel}>Wrong Feedback:</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder='Type out feedback for wrong answer...'
                            value={question.wrongFeedback}
                            onChange={(e) => handleQuestionChange(index, "wrongFeedback", e.target.value)}
                            style={formStyles.formControl}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                ))}
                
                {/* Navigation and Submit Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    style={{...formStyles.button, ...formStyles.secondaryButton}}
                    onClick={handleBackToQuizInfo}
                  >
                    Back to Quiz Info
                  </Button>
                  <div>
                    <Button 
                      type="submit" 
                      style={{...formStyles.button, ...formStyles.primaryButton}}
                    >
                      Submit Quiz
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Form>
        </Container>
      </div>

      {/* Submission Modal */}
      <Modal show={showSubmissionModal} centered backdrop="static">
        <Modal.Body className="text-center p-5" style={{ borderRadius: '16px' }}>
          {submissionStatus === "loading" ? (
            <>
              <DotLottieReact
                src="https://lottie.host/bc60c946-f308-4d8c-90d3-dd5109fa973d/5GrpHGTbi1.lottie"
                loop autoplay
                className="mx-auto"
              />
              <h4 className="mt-4" style={{ color: colors.primary }}>
                Updating Quiz... Please hold tight!
              </h4>
            </>
          ) : (
            <>
              <DotLottieReact
                src="https://lottie.host/84f52346-0c0b-4fe8-a310-bdf024ef7fee/lyAlxYpVuS.lottie"
                loop={false} autoplay
                className="mx-auto"
              />
              <h4 className="mt-4" style={{ color: colors.primary }}>
                Quiz Updated Successfully!
              </h4>
              <p className="mt-3" style={{ color: colors.dark }}>
                Your quiz has been updated and will be reviewed by our admins.
                <br /><br />
                Thank you for contributing to ScamWise! 🎉
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal 
        show={alertModalShow} 
        onHide={() => setAlertModalShow(false)} 
        centered
        style={formStyles.alertModal}
      >
        <Modal.Header 
          style={{
            ...formStyles.alertModalHeader,
            borderBottomColor: alertStyles[alertType]?.borderColor
          }}
          closeButton
        >
          <DotLottieReact
            src={alertStyles[alertType]?.animation}
            loop={false} 
            autoplay
            style={{ width: '80px', height: '80px' }}
          />
        </Modal.Header>
        <Modal.Body style={formStyles.alertModalBody}>
          <h4 style={{ color: colors.dark, marginBottom: '1rem' }}>
            {alertStyles[alertType]?.title}
          </h4>
          <p style={{ color: colors.dark }}>{alertMessage}</p>
        </Modal.Body>
        <Modal.Footer style={formStyles.alertModalFooter}>
          <Button 
            onClick={() => setAlertModalShow(false)} 
            style={{
              ...formStyles.button,
              ...formStyles.primaryButton,
              minWidth: '120px'
            }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EditCustomQuiz;