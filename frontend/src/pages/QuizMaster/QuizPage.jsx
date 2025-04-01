import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, OverlayTrigger, Tooltip, Modal, Nav, ProgressBar, Badge } from 'react-bootstrap';

const QuizPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const quizDetails = location.state || {}; // Extract passed quiz data
    const [questionList, setQuestionList] = useState([]);
    const [timer, setTimer] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [unansweredQuestions, setUnansweredQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    // Add these state variables to the existing state declarations
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Color scheme
    const colors = {
        primary: '#4a6fa5',
        secondary: '#166088',
        accent: '#7db9b6',
        light: '#f5f7fa',
        dark: '#333333',
        success: '#4caf50',
        warning: '#ff9800',
        danger: '#f44336',
        selected: '#e8f4f8'
    };

    useEffect(() => {
        if (quizDetails.quizId) {
            fetch(`http://172.31.17.239:5005/get_quiz_questions/${quizDetails.quizId}`)
                .then(response => response.json())
                .then(data => setQuestionList(data))
                .catch(error => console.error('Error fetching quiz questions:', error));
        }
    }, [quizDetails.quizId]);

    // Add this useEffect to fetch leaderboard data
    useEffect(() => {
        if (quizDetails.quizId) {
            fetch(`http://172.31.17.239:5006/get_quiz_leaderboard/${quizDetails.quizId}`)
                .then(response => response.json())
                .then(data => {
                    // Sort leaderboard by number of correct answers (descending) and time taken (ascending)
                    const sortedData = data.sort((a, b) => {
                        if (a.number_correct !== b.number_correct) {
                            return b.number_correct - a.number_correct;
                        }
                        return a.time_taken - b.time_taken;
                    });
                    setLeaderboardData(sortedData);
                })
                .catch(error => console.error('Error fetching leaderboard data:', error));
        }
    }, [quizDetails.quizId]);

    useEffect(() => {
        const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleOptionSelect = (questionId, optionKey) => {
        setSelectedOptions(prev => {
            // If selecting the same option that's already selected, unselect it
            if (prev[questionId] === optionKey) {
                const newSelections = {...prev};
                delete newSelections[questionId];
                return newSelections;
            } else {
                // Otherwise, select the new option
                return {
                    ...prev,
                    [questionId]: optionKey
                };
            }
        });
    };

    const handleSubmit = () => {
        const unanswered = questionList.filter(q => !selectedOptions[q.questionId]).map(q => q.questionId);
        setUnansweredQuestions(unanswered);
        setShowModal(true);
    };

    const confirmSubmit = () => {
        const payload = {
            quiz_id: quizDetails.quizId,
            user_id: localStorage.getItem('userId'),
            time_taken: timer,
            user_answers: selectedOptions,
            topic: quizDetails.mainTopic,
            sub_topic: quizDetails.subTopic
        };

        fetch("http://172.31.17.239:5004/new_quiz_submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        setShowModal(false);
        navigate('/quiz-master/quiz-summary', {
            state: {
                quizDetails,
                questionList,
                selectedOptions,
                timeTaken: timer,
            },
        });
    };

    const calculateProgress = () => {
        if (questionList.length === 0) return 0;
        const answeredCount = Object.keys(selectedOptions).length;
        return Math.round((answeredCount / questionList.length) * 100);
    };

    const navigateToQuestion = (index) => {
        setCurrentQuestionIndex(index);
        setShowSummary(false);
        window.scrollTo(0, 0);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questionList.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Show summary when reaching the end
            setShowSummary(true);
        }
        window.scrollTo(0, 0);
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setShowSummary(false);
        }
        window.scrollTo(0, 0);
    };

    // Add this function to render the leaderboard
    const renderLeaderboard = () => {
        return (
            <Card 
                className="mb-4 shadow-sm" 
                style={{ 
                    borderRadius: '8px', 
                    backgroundColor: colors.light,
                    borderLeft: `4px solid ${colors.primary}`
                }}
            >
                <Card.Header 
                    style={{ 
                        backgroundColor: 'white', 
                        borderBottom: `2px solid ${colors.accent}`,
                        padding: '15px 20px'
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0" style={{ color: colors.primary, fontWeight: 'bold' }}>
                            <span className="material-symbols-rounded me-2" style={{ verticalAlign: 'middle' }}>
                                leaderboard
                            </span>
                            Quiz Leaderboard
                        </h5>
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={() => setShowLeaderboard(!showLeaderboard)}
                        >
                            {showLeaderboard ? 'Hide' : 'Show'}
                        </Button>
                    </div>
                </Card.Header>
                {showLeaderboard && (
                    <Card.Body>
                        {leaderboardData.length > 0 ? (
                            <div className="leaderboard-container">
                                {leaderboardData.map((entry, index) => (
                                    <div 
                                        key={entry.session_id} 
                                        className="d-flex align-items-center p-3 mb-2"
                                        style={{
                                            backgroundColor: index === 0 ? '#fff9e6' : 'white',
                                            border: `1px solid ${index === 0 ? '#ffd700' : '#dee2e6'}`,
                                            borderRadius: '8px',
                                            boxShadow: index === 0 ? '0 2px 8px rgba(255, 215, 0, 0.2)' : 'none'
                                        }}
                                    >
                                        <div 
                                            style={{ 
                                                minWidth: '36px',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: index < 3 ? colors.primary : colors.secondary,
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                marginRight: '12px'
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div 
                                            className="profile-img"
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                marginRight: '15px',
                                                border: `2px solid ${index < 3 ? colors.primary : colors.secondary}`
                                            }}
                                        >
                                            <img 
                                                src={entry.profilePicturePath} 
                                                alt={entry.fullName}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/45';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-0 font-weight-semibold">
                                                {entry.fullName}
                                                {index === 0 && (
                                                    <span className="ms-2" role="img" aria-label="trophy">🏆</span>
                                                )}
                                            </h6>
                                            <small className="text-muted">
                                                {new Date(entry.time_created).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className="d-flex" style={{ gap: '20px' }}>
                                            <div className="text-center">
                                                <small className="d-block text-muted">Score</small>
                                                <span style={{ 
                                                    color: colors.primary, 
                                                    fontWeight: 'bold' 
                                                }}>
                                                    {entry.number_correct}/{questionList.length}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <small className="d-block text-muted">Time</small>
                                                <span style={{ fontWeight: '500' }}>
                                                    {formatTime(entry.time_taken)}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <small className="d-block text-muted">XP</small>
                                                <span style={{ 
                                                    color: '#F59E0B', 
                                                    fontWeight: 'bold' 
                                                }}>
                                                    {entry.session_xp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="mb-0">No leaderboard data available yet.</p>
                            </div>
                        )}
                    </Card.Body>
                )}
            </Card>
        );
    };

    const renderQuestionNav = () => {
        return (
            <div className="d-flex flex-wrap justify-content-center mb-4" style={{ gap: '8px' }}>
                {questionList.map((question, index) => (
                    <Button 
                        key={question.questionId}
                        variant={selectedOptions[question.questionId] ? "primary" : "outline-secondary"}
                        onClick={() => navigateToQuestion(index)}
                        style={{ 
                            width: '40px', 
                            height: '40px',
                            borderRadius: '50%',
                            padding: 0,
                            backgroundColor: selectedOptions[question.questionId] ? colors.primary : 'white',
                            borderColor: selectedOptions[question.questionId] ? colors.primary : colors.secondary,
                            color: selectedOptions[question.questionId] ? 'white' : colors.dark,
                            fontWeight: 'bold'
                        }}
                    >
                        {index + 1}
                    </Button>
                ))}
            </div>
        );
    };

    const renderSingleQuestion = (question, index) => {
        return (
            <Card 
                key={question.questionId} 
                className="mb-4 shadow-sm"
                style={{ 
                    borderLeft: `4px solid ${colors.accent}`,
                    borderRadius: '8px',
                    backgroundColor: colors.light
                }}
            >
                <Card.Body>
                    <Card.Title className="d-flex align-items-center mb-4">
                        <span className="me-2" style={{ 
                            backgroundColor: colors.primary,
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>
                            {index + 1}
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>{question.question}</span>
                        <OverlayTrigger 
                            placement="top" 
                            overlay={
                                <Tooltip id={`tooltip-${question.questionId}`}>
                                    {question.hint}
                                </Tooltip>
                            }
                        >
                            <span className="material-symbols-rounded ms-3" style={{ color: colors.secondary, cursor: 'pointer' }}>
                                info
                            </span>
                        </OverlayTrigger>
                    </Card.Title>
                    <div className="options-container">
                        {Object.keys(question.choices).map(key => (
                            <div
                                key={key}
                                className="option-card mb-2"
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedOptions[question.questionId] === key ? colors.selected : 'white',
                                    border: `1px solid ${selectedOptions[question.questionId] === key ? colors.primary : '#dee2e6'}`,
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => handleOptionSelect(question.questionId, key)}
                            >
                                <div 
                                    className="option-indicator me-3"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        border: `2px solid ${selectedOptions[question.questionId] === key ? colors.primary : colors.secondary}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {selectedOptions[question.questionId] === key && (
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: colors.primary
                                        }}></div>
                                    )}
                                </div>
                                <div className="option-text">
                                    <strong>{key}.</strong> {question.choices[key]}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        );
    };

    const renderQuizSummary = () => {
        return (
            <div className="quiz-summary">
                <Card className="mb-4 shadow-sm" style={{ borderRadius: '8px', backgroundColor: colors.light }}>
                    <Card.Body>
                        <Card.Title className="text-center mb-4" style={{ color: colors.primary }}>
                            Quiz Summary - Review Your Answers
                        </Card.Title>
                        
                        <div className="summary-stats d-flex justify-content-around mb-4">
                            <div className="text-center">
                                <h5>Total Questions</h5>
                                <p className="h3">{questionList.length}</p>
                            </div>
                            <div className="text-center">
                                <h5>Answered</h5>
                                <p className="h3">{Object.keys(selectedOptions).length}</p>
                            </div>
                            <div className="text-center">
                                <h5>Time Taken</h5>
                                <p className="h3">{formatTime(timer)}</p>
                            </div>
                        </div>
                        
                        {questionList.map((question, index) => (
                            <Card 
                                key={question.questionId} 
                                className="mb-3"
                                style={{ 
                                    borderLeft: selectedOptions[question.questionId] 
                                        ? `4px solid ${colors.primary}` 
                                        : `4px solid ${colors.warning}`,
                                    borderRadius: '6px'
                                }}
                            >
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6>
                                                <strong>Question {index + 1}:</strong> {question.question}
                                            </h6>
                                            {selectedOptions[question.questionId] ? (
                                                <p className="mb-0">
                                                    <strong>Your answer:</strong> {question.choices[selectedOptions[question.questionId]]}
                                                    <b className="ms-2" style={{ color: colors.secondary }}>
                                                        [{selectedOptions[question.questionId]}]
                                                    </b>
                                                </p>
                                            ) : (
                                                <p className="mb-0 text-warning">
                                                    <strong>Not answered</strong>
                                                </p>
                                            )}
                                        </div>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm"
                                            onClick={() => navigateToQuestion(index)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </Card.Body>
                </Card>
                
                <div className="d-flex justify-content-center mt-4">
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        style={{ 
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                            fontSize: '1.1em'
                        }}
                        className='mb-4 px-3'
                    >
                        Submit Quiz
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Fixed Header */}
            <div 
                style={{ 
                    backgroundColor: 'white', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <Container fluid className="py-3">
                    <Row className="align-items-center">
                        <Col md={10}>

                            <h2 className='d-flex align-items-center'>
                                Quiz #{quizDetails.quizId}: {quizDetails.quizName}
                                
                                <Badge 
                                    bg={quizDetails.difficulty === 'Beginner' ? 'success' : quizDetails.difficulty === 'Intermediate' ? 'warning' : 'danger'}
                                    text={quizDetails.difficulty === 'Beginner' ? 'white' : quizDetails.difficulty === 'Intermediate' ? 'dark' : 'white'} 
                                    className="mx-4"
                                    style={{ fontSize: '15px' }}
                                >
                                    {quizDetails.difficulty}
                                </Badge>
                            </h2>
                            <p className="mb-0 text-muted">
                                {quizDetails.mainTopic} &gt; {quizDetails.subTopic}
                            </p>
                        </Col>
                        <Col md={2} className="d-flex justify-content-end align-items-center">
                            <div className="d-flex align-items-center me-4">
                                <span className="material-symbols-rounded me-1" style={{ color: colors.primary }}>timer</span>
                                <span style={{ fontWeight: 'bold', color: colors.primary }}>{formatTime(timer)}</span>
                            </div>
                            <Nav.Link href="/quiz-master/custom-practice">
                                <Button 
                                    variant="outline-success"
                                >
                                    View Other Quizzes
                                </Button>
                            </Nav.Link>
                        </Col>
                    </Row>
                    <Row    >
                        <Col>
                            <ProgressBar 
                                now={calculateProgress()} 
                                label={`${calculateProgress()}%`}
                                style={{ height: '2em', backgroundColor: '#e9ecef' }}
                                variant="info"
                                className='my-3'
                            />
                            <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                    {Object.keys(selectedOptions).length} of {questionList.length} questions answered
                                </small>
                                {!showSummary && questionList.length > 0 && (
                                    <small className="text-muted">
                                        Question {currentQuestionIndex + 1} of {questionList.length}
                                    </small>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Content */}
            <Container className="pt-5">
                <Row>
                    <Col>
                        {/* Question Navigation */}
                        {renderQuestionNav()}

                        {/* Leaderboard */}
                        {renderLeaderboard()}

                        {/* Questions or Summary */}
                        {showSummary ? (
                            renderQuizSummary()
                        ) : (
                            questionList.length > 0 && currentQuestionIndex < questionList.length && (
                                <>
                                    {renderSingleQuestion(questionList[currentQuestionIndex], currentQuestionIndex)}
                                    <div className="d-flex justify-content-between mt-4">
                                        <Button 
                                            variant="secondary"
                                            onClick={handlePreviousQuestion}
                                            disabled={currentQuestionIndex === 0}
                                        >
                                            Previous
                                        </Button>
                                        <Button 
                                            variant="secondary"
                                            onClick={handleNextQuestion}
                                        >
                                            {currentQuestionIndex === questionList.length - 1 ? 'Review All Answers' : 'Next'}
                                        </Button>
                                    </div>
                                </>
                            )
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton style={{ borderBottom: `3px solid ${colors.primary}` }}>
                    <Modal.Title>Confirm Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {unansweredQuestions.length > 0 ? (
                        <>
                            <div className="alert alert-warning">
                                <p><strong>You have {unansweredQuestions.length} unanswered questions:</strong></p>
                                <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                                    {unansweredQuestions.map(qId => {
                                        // Find the index of the question with this ID
                                        const questionIndex = questionList.findIndex(q => q.questionId === qId);
                                        return (
                                            <Badge 
                                                key={qId} 
                                                bg="warning" 
                                                text="dark"
                                                style={{ 
                                                    fontSize: '0.9em', 
                                                    padding: '5px 10px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    setShowModal(false);
                                                    navigateToQuestion(questionIndex);
                                                }}
                                            >
                                                Question {questionIndex + 1}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                            <p>Are you sure you want to submit the quiz with unanswered questions?</p>
                        </>
                    ) : (
                        <p>Are you sure you want to submit your answers? You&apos;ve answered all questions.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowModal(false)}
                        style={{ 
                            borderColor: colors.secondary,
                            color: colors.secondary
                        }}
                    >
                        Continue Quiz
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={confirmSubmit}
                        style={{ 
                            backgroundColor: colors.primary,
                            borderColor: colors.primary
                        }}
                    >
                        Submit Quiz
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default QuizPage;