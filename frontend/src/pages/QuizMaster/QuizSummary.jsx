import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, Badge, Row, Col, Container, Nav, Button, ProgressBar } from 'react-bootstrap';
import { Clock, Trophy, BarChart2, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import Confetti from 'react-confetti';

const QuizSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { quizDetails, questionList, selectedOptions, timeTaken } = location.state || {};
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAllQuestions, setShowAllQuestions] = useState(false);

    // Color scheme matching QuizPage
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
        if (!quizDetails || !questionList || !selectedOptions) {
            navigate("/quiz-master");
        }
    }, [quizDetails, questionList, selectedOptions, navigate]);

    if (!quizDetails || !questionList || !selectedOptions) {
        return null;
    }

    const correctAnswers = questionList.filter((q) => selectedOptions[q.questionId] === q.correctAnswer).length;
    const totalQuestions = questionList.length;
    const score = (correctAnswers / totalQuestions) * 100;

    useEffect(() => {
        if (correctAnswers === totalQuestions) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [correctAnswers, totalQuestions]);

    const getScoreColor = (score) => {
        if (score >= 75) return colors.success;
        if (score >= 50) return colors.warning;
        return colors.danger;
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const renderMessage = () => {
        if (correctAnswers === totalQuestions) {
            return <h2 style={{ color: colors.success }}>🎉 Congratulations! You aced it! 🎉</h2>;
        } else if (score >= 50) {
            return <h2 style={{ color: colors.warning }}>📖 Great effort! Keep practicing! 📖</h2>;
        } else {
            return <h2 style={{ color: colors.danger }}>💪 Don&apos;t give up! Keep trying! 💪</h2>;
        }
    };

    const navigateQuestion = (direction) => {
        if (direction === 'next' && currentQuestionIndex < questionList.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else if (direction === 'prev' && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
        window.scrollTo(0, 0);
    };

    const toggleQuestionView = () => {
        setShowAllQuestions(!showAllQuestions);
        window.scrollTo(0, 0);
    };

    const renderQuestionNav = () => {
        return (
            <div className="d-flex flex-wrap justify-content-center mb-4" style={{ gap: '8px' }}>
                {questionList.map((question, index) => {
                    const isCorrect = selectedOptions[question.questionId] === question.correctAnswer;
                    return (
                        <Button 
                            key={question.questionId}
                            variant={isCorrect ? "success" : "danger"}
                            onClick={() => setCurrentQuestionIndex(index)}
                            style={{ 
                                width: '40px', 
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0,
                                backgroundColor: isCorrect ? colors.success : colors.danger,
                                color: 'white',
                                fontWeight: 'bold',
                                opacity: currentQuestionIndex === index ? 1 : 0.7
                            }}
                        >
                            {index + 1}
                        </Button>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {showConfetti && <Confetti />}
            
            {/* Fixed Header */}
            <div style={{ 
                backgroundColor: 'white', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <Container fluid className="py-3">
                    <Row className="align-items-center">
                        <Col md={9}>
                            <h2 className="d-flex align-items-center">
                                Quiz Results: {quizDetails.quizName}
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
                        <Col md={3} className="d-flex justify-content-end align-items-center">
                            <div className="d-flex align-items-center me-4">
                                <Clock size={20} className="me-1" style={{ color: colors.primary }} />
                                <span style={{ fontWeight: 'bold', color: colors.primary }}>{formatTime(timeTaken)}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <Trophy size={20} className="me-1" style={{ color: colors.primary }} />
                                <span style={{ fontWeight: 'bold', color: getScoreColor(score) }}>{score.toFixed(1)}%</span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ProgressBar 
                                now={score} 
                                label={`${score.toFixed(1)}%`}
                                style={{ height: '1.5em', backgroundColor: '#e9ecef' }}
                                variant={score >= 75 ? "success" : score >= 50 ? "warning" : "danger"}
                                className="my-3"
                            />
                            <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                    Scored {correctAnswers} out of {totalQuestions} questions
                                </small>
                                {!showAllQuestions && (
                                    <small className="text-muted">
                                        Reviewing Question {currentQuestionIndex + 1} of {totalQuestions}
                                    </small>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="pt-4">
                {/* Score Overview Card */}
                <Card 
                    className="mb-4 shadow-sm text-center" 
                    style={{ 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        borderTop: `4px solid ${getScoreColor(score)}`
                    }}
                >
                    <Card.Body className="py-4">
                        {renderMessage()}
                        <h3 className="mt-3">Your Score: <span style={{ fontWeight: 'bold', color: getScoreColor(score) }}>{score.toFixed(1)}%</span></h3>
                        
                        <div className="mt-4">
                            <Row className="text-center">
                                <Col md={2} className="mb-3 mb-md-0">
                                    <div className="p-3" style={{ backgroundColor: colors.light, borderRadius: '8px' }}>
                                        <div className="mb-2">
                                            <BarChart2 size={30} style={{ color: colors.primary }} />
                                        </div>
                                        <h5>Total Questions</h5>
                                        <p className="h3 mb-0">{totalQuestions}</p>
                                    </div>
                                </Col>
                                <Col md={3} className="mb-3 mb-md-0">
                                    <div className="p-3" style={{ backgroundColor: colors.light, borderRadius: '8px' }}>
                                        <div className="mb-2">
                                            <Award size={30} style={{ color: colors.success }} />
                                        </div>
                                        <h5>Correct Answers</h5>
                                        <p className="h3 mb-0" style={{ color: colors.success }}>{correctAnswers}</p>
                                    </div>
                                </Col>
                                <Col md={3} className="mb-3 mb-md-0">
                                    <div className="p-3" style={{ backgroundColor: colors.light, borderRadius: '8px' }}>
                                        <div className="mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"></path></svg>
                                        </div>
                                        <h5>Incorrect Answers</h5>
                                        <p className="h3 mb-0" style={{ color: colors.danger }}>{totalQuestions - correctAnswers}</p>
                                    </div>
                                </Col>
                                <Col md={2}>
                                    <div className="p-3" style={{ backgroundColor: colors.light, borderRadius: '8px' }}>
                                        <div className="mb-2">
                                            <Clock size={30} style={{ color: colors.secondary }} />
                                        </div>
                                        <h5>Time Taken</h5>
                                        <p className="h3 mb-0">{formatTime(timeTaken)}</p>
                                    </div>
                                </Col>
                                <Col md={2}>
                                    <div className="p-3" style={{ backgroundColor: colors.light, borderRadius: '8px' }}>
                                        <div className="mb-2">
                                            <Trophy size={30} style={{ color: '#ffa500' }} />
                                        </div>
                                        <h5>XP Earned</h5>
                                        <p className="h3 mb-0">
                                            {/* If number of correct == number of questions ; quizDetails.xp , otherwise 0*/}
                                            {correctAnswers === totalQuestions ? quizDetails.xp : 0}
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card.Body>
                </Card>

                {/* Question Navigation */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="m-0" style={{ color: colors.primary }}>Question Review</h3>
                        <Button 
                            variant="outline-primary" 
                            onClick={toggleQuestionView}
                            style={{
                                borderColor: colors.primary,
                                color: colors.primary
                            }}
                        >
                            {showAllQuestions ? "Show One Question at a Time" : "Show All Questions"}
                        </Button>
                    </div>
                    {renderQuestionNav()}
                </div>

                {/* Question Review */}
                {showAllQuestions ? (
                    // Show all questions
                    questionList.map((q, index) => {
                        const isCorrect = selectedOptions[q.questionId] === q.correctAnswer;
                        return renderQuestionCard(q, index, isCorrect);
                    })
                ) : (
                    // Show single question with navigation
                    <div>
                        {renderQuestionCard(
                            questionList[currentQuestionIndex], 
                            currentQuestionIndex, 
                            selectedOptions[questionList[currentQuestionIndex].questionId] === questionList[currentQuestionIndex].correctAnswer
                        )}
                        
                        <div className="d-flex justify-content-between mt-4 mb-5">
                            <Button 
                                variant="outline-secondary"
                                onClick={() => navigateQuestion('prev')}
                                disabled={currentQuestionIndex === 0}
                                className="d-flex align-items-center"
                            >
                                <ChevronLeft size={18} className="me-1" /> Previous Question
                            </Button>
                            <Button 
                                variant="outline-secondary"
                                onClick={() => navigateQuestion('next')}
                                disabled={currentQuestionIndex === questionList.length - 1}
                                className="d-flex align-items-center"
                            >
                                Next Question <ChevronRight size={18} className="ms-1" />
                            </Button>
                        </div>
                    </div>
                )}

                <div className="text-center align-items-center d-flex justify-content-center gap-4 pb-5">
                    <Nav.Link href="/quiz-master">
                        <Button 
                            variant="primary" 
                            style={{ 
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                                padding: '10px 24px',
                                fontSize: '1.1rem'
                            }}
                        >
                            Try Other Quizzes!
                        </Button>
                    </Nav.Link>

                    <Nav.Link href="/profile">
                        <Button 
                            variant="warning"
                            style={{ 
                                borderColor: colors.warning,    
                                padding: '10px 24px',
                                fontSize: '1.1rem'
                            }}
                        >
                            Go to Profile
                        </Button>
                    </Nav.Link>
                </div>
            </Container>
        </div>
    );

    function renderQuestionCard(q, index, isCorrect) {
        return (
            <Card 
                key={q.questionId} 
                className="mb-4 shadow-sm"
                style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    borderLeft: `4px solid ${isCorrect ? colors.success : colors.danger}`,
                }}
            >
                <Card.Header style={{ 
                    backgroundColor: isCorrect ? '#e6f7e6' : '#f8d7da',
                    borderBottom: `1px solid ${isCorrect ? colors.success : colors.danger}`,
                    padding: '12px 20px'
                }}>
                    <div className="d-flex align-items-center">
                        <span 
                            className="me-3" 
                            style={{ 
                                backgroundColor: isCorrect ? colors.success : colors.danger,
                                color: 'white',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            {index + 1}
                        </span>
                        <h5 className="mb-0">Question {index + 1}</h5>
                        <Badge 
                            bg={isCorrect ? "success" : "danger"} 
                            className="ms-auto"
                            style={{ fontSize: '0.9rem', padding: '5px 10px' }}
                        >
                            {isCorrect ? "CORRECT" : "INCORRECT"}
                        </Badge>
                    </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                    <h5 className="mb-4">{q.question}</h5>
                    
                    <div className="mb-4">
                        <h6 className="mb-3">Choices:</h6>
                        {Object.keys(q.choices).map((key) => (
                            <div
                                key={key}
                                style={{
                                    padding: '10px 16px',
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    backgroundColor: selectedOptions[q.questionId] === key 
                                        ? (isCorrect ? '#e6f7e6' : '#f8d7da') 
                                        : key === q.correctAnswer ? '#e6f7e6' : 'white',
                                    border: `1px solid ${
                                        selectedOptions[q.questionId] === key 
                                            ? (isCorrect ? colors.success : colors.danger) 
                                            : key === q.correctAnswer ? colors.success : '#dee2e6'
                                    }`,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <div 
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        marginRight: '12px',
                                        backgroundColor: selectedOptions[q.questionId] === key 
                                            ? (isCorrect ? colors.success : colors.danger) 
                                            : key === q.correctAnswer ? colors.success : colors.light,
                                        color: (selectedOptions[q.questionId] === key || key === q.correctAnswer) ? 'white' : colors.dark,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {key}
                                </div>
                                <div>{q.choices[key]}</div>
                                {key === q.correctAnswer && (
                                    <Badge bg="success" className="ms-auto" style={{ padding: '5px 10px' }}>
                                        Correct Answer
                                    </Badge>
                                )}
                                {selectedOptions[q.questionId] === key && key !== q.correctAnswer && (
                                    <Badge bg="danger" className="ms-auto" style={{ padding: '5px 10px' }}>
                                        Your Answer
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div 
                        className="p-3 mt-4" 
                        style={{ 
                            borderRadius: '8px',
                            backgroundColor: isCorrect ? '#e6f7e6' : '#f8d7da',
                            borderLeft: `4px solid ${isCorrect ? colors.success : colors.danger}`
                        }}
                    >
                        <h6 className="mb-2">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke={isCorrect ? colors.success : colors.danger}
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                style={{ marginRight: '8px' }}
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Feedback:
                        </h6>
                        <p className="mb-0">{isCorrect ? q.correctFeedback : q.wrongFeedback}</p>
                    </div>
                </Card.Body>
            </Card>
        );
    }
};

export default QuizSummary;