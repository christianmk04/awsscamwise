import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, Badge, Row, Col, Container, Nav, Button, ProgressBar } from 'react-bootstrap';
import { Clock, Trophy, BarChart2, Award, ChevronLeft, ChevronRight, Info, ThumbsUp, ThumbsDown } from 'lucide-react';
import Confetti from 'react-confetti';

const QuizSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { quizDetails, questionList, selectedOptions, timeTaken } = location.state || {};
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAllQuestions, setShowAllQuestions] = useState(false);

    // Consistent color scheme throughout the page
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
                                opacity: currentQuestionIndex === index ? 1 : 0.7,
                                border: currentQuestionIndex === index ? '2px solid #333' : 'none',
                                boxShadow: currentQuestionIndex === index ? '0 0 0 2px rgba(255,255,255,0.8)' : 'none'
                            }}
                        >
                            {index + 1}
                        </Button>
                    );
                })}
            </div>
        );
    };

    // Create a consistent stat box component to reduce repetition
    const StatBox = ({ icon, title, value, color, bgColor }) => (
        <div className="p-3" style={{ 
            backgroundColor: bgColor || colors.light, 
            borderRadius: '8px',
            height: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s',
            border: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div className="text-center mb-2">
                {icon}
            </div>
            <h5 className="text-center mb-2" style={{ fontSize: '0.95rem', color: colors.dark }}>{title}</h5>
            <p className="h3 mb-0 text-center" style={{ color: color || colors.dark, fontWeight: 'bold' }}>{value}</p>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {showConfetti && <Confetti />}
            
            {/* Fixed Header */}
            <div style={{ 
                backgroundColor: 'white', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                                    style={{ fontSize: '15px', padding: '6px 10px' }}
                                >
                                    {quizDetails.difficulty}
                                </Badge>
                            </h2>
                            <p className="mb-0 text-muted">
                                {quizDetails.mainTopic} &gt; {quizDetails.subTopic}
                            </p>
                        </Col>
                        <Col md={3} className="d-flex justify-content-end align-items-center">
                            <div className="d-flex align-items-center me-4 p-2 rounded" style={{ backgroundColor: colors.light }}>
                                <Clock size={20} className="me-2" style={{ color: colors.primary }} />
                                <span style={{ fontWeight: 'bold', color: colors.primary }}>{formatTime(timeTaken)}</span>
                            </div>
                            <div className="d-flex align-items-center p-2 rounded" style={{ backgroundColor: colors.light }}>
                                <Trophy size={20} className="me-2" style={{ color: colors.primary }} />
                                <span style={{ fontWeight: 'bold', color: getScoreColor(score) }}>{score.toFixed(1)}%</span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ProgressBar 
                                now={score} 
                                label={`${score.toFixed(1)}%`}
                                style={{ height: '1.5em', backgroundColor: '#e9ecef', borderRadius: '8px' }}
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
                        borderTop: `4px solid ${getScoreColor(score)}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                >
                    <Card.Body className="py-4">
                        {renderMessage()}
                        <h3 className="mt-3">Your Score: <span style={{ fontWeight: 'bold', color: getScoreColor(score) }}>{score.toFixed(1)}%</span></h3>
                        
                        <div className="mt-4">
                            <Row className="text-center g-3">
                                <Col md={2} className="mb-3 mb-md-0">
                                    <StatBox 
                                        icon={<BarChart2 size={30} style={{ color: colors.primary }} />}
                                        title="Total Questions"
                                        value={totalQuestions}
                                    />
                                </Col>
                                <Col md={3} className="mb-3 mb-md-0">
                                    <StatBox 
                                        icon={<ThumbsUp size={30} style={{ color: colors.success }} />}
                                        title="Correct Answers"
                                        value={correctAnswers}
                                        color={colors.success}
                                        bgColor="#f0f9f0"
                                    />
                                </Col>
                                <Col md={3} className="mb-3 mb-md-0">
                                    <StatBox 
                                        icon={<ThumbsDown size={30} style={{ color: colors.danger }} />}
                                        title="Incorrect Answers"
                                        value={totalQuestions - correctAnswers}
                                        color={colors.danger}
                                        bgColor="#fdf0f0"
                                    />
                                </Col>
                                <Col md={2}>
                                    <StatBox 
                                        icon={<Clock size={30} style={{ color: colors.secondary }} />}
                                        title="Time Taken"
                                        value={formatTime(timeTaken)}
                                        color={colors.secondary}
                                    />
                                </Col>
                                <Col md={2}>
                                    <StatBox 
                                        icon={<Trophy size={30} style={{ color: '#ffa500' }} />}
                                        title="XP Earned"
                                        value={correctAnswers === totalQuestions ? quizDetails.xp : 0}
                                        color="#ffa500"
                                        bgColor="#fff9e6"
                                    />
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
                                color: colors.primary,
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontWeight: '500'
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
                                style={{
                                    borderRadius: '8px',
                                    padding: '10px 20px'
                                }}
                            >
                                <ChevronLeft size={18} className="me-2" /> Previous Question
                            </Button>
                            <Button 
                                variant="outline-secondary"
                                onClick={() => navigateQuestion('next')}
                                disabled={currentQuestionIndex === questionList.length - 1}
                                className="d-flex align-items-center"
                                style={{
                                    borderRadius: '8px',
                                    padding: '10px 20px'
                                }}
                            >
                                Next Question <ChevronRight size={18} className="ms-2" />
                            </Button>
                        </div>
                    </div>
                )}

                <div className="text-center d-flex justify-content-center gap-4 pb-5 mt-4">
                    <Button 
                        variant="primary" 
                        as={Nav.Link}
                        href="/quiz-master"
                        style={{ 
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                            color: 'white',
                            padding: '12px 26px',
                            fontSize: '1.1rem',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            textDecoration: 'none'
                        }}
                    >
                        Try Other Quizzes!
                    </Button>

                    <Button 
                        variant="warning"
                        as={Nav.Link}
                        href="/profile"
                        style={{ 
                            borderColor: colors.warning,    
                            padding: '12px 26px',
                            fontSize: '1.1rem',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            textDecoration: 'none'
                        }}
                    >
                        Go to Profile
                    </Button>
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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
            >
                <Card.Header style={{ 
                    backgroundColor: isCorrect ? '#e6f7e6' : '#f8d7da',
                    borderBottom: `1px solid ${isCorrect ? colors.success : colors.danger}`,
                    padding: '16px 20px'
                }}>
                    <div className="d-flex align-items-center">
                        <span 
                            className="me-3" 
                            style={{ 
                                backgroundColor: isCorrect ? colors.success : colors.danger,
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}
                        >
                            {index + 1}
                        </span>
                        <h5 className="mb-0 fw-bold">Question {index + 1}</h5>
                        <Badge 
                            bg={isCorrect ? "success" : "danger"} 
                            className="ms-auto"
                            style={{ 
                                fontSize: '0.9rem', 
                                padding: '6px 12px',
                                borderRadius: '6px'
                            }}
                        >
                            {isCorrect ? "CORRECT" : "INCORRECT"}
                        </Badge>
                    </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                    <h5 className="mb-4 fw-bold">{q.question}</h5>
                    
                    <div className="mb-4">
                        <h6 className="mb-3 fw-bold">Choices:</h6>
                        {Object.keys(q.choices).map((key) => {
                            const isUserSelection = selectedOptions[q.questionId] === key;
                            const isCorrectAnswer = key === q.correctAnswer;
                            
                            return (
                                <div
                                    key={key}
                                    style={{
                                        padding: '12px 18px',
                                        marginBottom: '10px',
                                        borderRadius: '8px',
                                        backgroundColor: isUserSelection 
                                            ? (isCorrect ? '#e6f7e6' : '#f8d7da') 
                                            : isCorrectAnswer ? '#e6f7e6' : 'white',
                                        border: `2px solid ${
                                            isUserSelection 
                                                ? (isCorrect ? colors.success : colors.danger) 
                                                : isCorrectAnswer ? colors.success : '#dee2e6'
                                        }`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxShadow: (isUserSelection || isCorrectAnswer) ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                                    }}
                                >
                                    <div 
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            marginRight: '14px',
                                            backgroundColor: isUserSelection 
                                                ? (isCorrect ? colors.success : colors.danger) 
                                                : isCorrectAnswer ? colors.success : colors.light,
                                            color: (isUserSelection || isCorrectAnswer) ? 'white' : colors.dark,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {key}
                                    </div>
                                    <div className={isCorrectAnswer ? 'fw-bold' : ''}>{q.choices[key]}</div>
                                    
                                    {/* Improved visibility for correct answer indicators */}
                                    {isCorrectAnswer && (
                                        <div className="ms-auto d-flex align-items-center bg-success text-white px-3 py-2 rounded-pill">
                                            <ThumbsUp size={16} className="me-1" />
                                            <span className="fw-bold">Correct Answer</span>
                                        </div>
                                    )}
                                    {isUserSelection && !isCorrectAnswer && (
                                        <div className="ms-auto d-flex align-items-center bg-danger text-white px-3 py-2 rounded-pill">
                                            <ThumbsDown size={16} className="me-1" />
                                            <span className="fw-bold">Your Answer</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div 
                        className="p-4 mt-4" 
                        style={{ 
                            borderRadius: '8px',
                            backgroundColor: isCorrect ? '#e6f7e6' : '#f8d7da',
                            borderLeft: `4px solid ${isCorrect ? colors.success : colors.danger}`,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                        }}
                    >
                        <h6 className="mb-2 d-flex align-items-center fw-bold">
                            <Info 
                                size={18} 
                                style={{ 
                                    marginRight: '10px',
                                    color: isCorrect ? colors.success : colors.danger 
                                }}
                            />
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
