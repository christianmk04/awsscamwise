import { Card, ListGroup, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FaBookmark, FaRegBookmark, FaBook } from 'react-icons/fa';
import { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, XCircle, Edit } from 'lucide-react'; 

const QMTopicSelection = ({ mainTopic, subTopicList, savedQuizzes, setSavedQuizzes, isAdmin, handleDeleteQuiz, userQuizSessions = [] }) => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    
    // State for confirmation modal
    const [showModal, setShowModal] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState('idle'); // idle, loading, success, error
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');

    // Map difficulty to visual elements
    const getDifficultyBadge = (level) => {
        const variants = {
            'Beginner': 'success',
            'Intermediate': 'warning',
            'Advanced': 'danger'
        };
        
        return (
            <Badge 
                bg={variants[level] || 'secondary'} 
                className="py-2 px-3 rounded-pill"
            >
                {level}
            </Badge>
        );
    };

    // Add this helper function to determine quiz status
    const getQuizStatus = (quizId) => {
        if (!userQuizSessions || userQuizSessions.length === 0) return null;
        
        const session = userQuizSessions.find(session => session.quiz_id === quizId);
        if (!session) return null;

        // If there are multiple sessions, check if any of them are completed (if any session has xp > 0)
        for (const session of userQuizSessions) {
            if (session.session_xp > 0) return 'completed';
        }

        // If no session has xp > 0, return 'attempted' if any session has xp = 0
        return 'attempted';
    };

    const handleQuizClick = (quiz) => {
        const quizData = {
            mainTopic: mainTopic,
            subTopic: quiz.subTopic,
            quizName: quiz.quizName,
            difficulty: quiz.difficulty,
            quizId: quiz.quizId,
            xp: quiz.xp
        };
        navigate('/quiz-master/quiz-page', { state: quizData });
    };

    // Add function to handle edit click
    const handleEditClick = (quizId, e) => {
        e.stopPropagation(); // Prevent quiz click when clicking edit
        navigate(`/quiz-master/edit-quiz`, { state: { quizId: quizId } });
    };

    const toggleBookmark = async (quizId, e) => {
        e.stopPropagation(); // Prevent quiz click when clicking bookmark
        
        const isSaved = savedQuizzes.includes(quizId);
        const url = isSaved ? 'http://localhost:5002/remove_saved_quiz' : 'http://localhost:5002/add_saved_quiz';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, quizId })
            });

            if (!response.ok) throw new Error('Failed to update bookmark');

            setSavedQuizzes(prev =>
                isSaved ? prev.filter(id => id !== quizId) : [...prev, quizId]
            );
        } catch (error) {
            alert('Error updating bookmark: ' + error);
        }
    };

    // New function to open confirmation modal
    const confirmDelete = (quizId, quizName) => {
        setQuizToDelete({ id: quizId, name: quizName });
        setDeleteStatus('idle');
        setDeleteMessage('');
        setShowModal(true);
    };

    // New function for handling the delete confirmation
    const handleConfirmDelete = async () => {
        try {
            setDeleteStatus('loading');
            setDeleteMessage('Deleting quiz...');
            
            // Call the existing handleDeleteQuiz function with a small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 800));
            
            await handleDeleteQuiz(quizToDelete.id);
            
            setDeleteStatus('success');
            setDeleteMessage('Quiz successfully deleted! Refreshing page now...');
            
            // Auto-close after success
            setTimeout(() => {
                setShowModal(false);
                setQuizToDelete(null);
                window.location.reload();
            }, 1500);
        } catch (error) {
            setDeleteStatus('error');
            setDeleteMessage('Failed to delete quiz. Please try again.' + error);
        }
    };

    // Close the delete modal
    const closeDeleteModal = () => {
        setShowModal(false);
        setQuizToDelete(null);
        setDeleteStatus('idle');
    };

    return (
        <div className="quiz-topic-container">
            <div className="topic-header mb-4">
                <h2 className="">
                    {mainTopic}
                </h2>
            </div>

            <div className="sub-topics-grid">
                {subTopicList.map(({ subTopic, quizzes }) => (

                    <Card 
                        key={subTopic} 
                        className="mb-4 shadow-sm border-0 h-100"
                    >
                        <Card.Header 
                            className="bg-primary text-white py-3"
                            style={{ borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}
                        >
                            <h5 className="mb-0 fw-bold">{subTopic}</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {quizzes.map(({ quizId, quizName, difficulty, xp, createdByUserId }) => (
                                <ListGroup.Item 
                                    key={quizId} 
                                    className={`py-3 border-bottom quiz-item ${
                                        getQuizStatus(quizId) ? `quiz-status-${getQuizStatus(quizId)}` : ''}`}
                                    onClick={() => handleQuizClick({ subTopic, quizName, difficulty, xp, quizId })}
                                    style={{ 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        // if quiz status is completed, set background color to green, else orange
                                        backgroundColor: getQuizStatus(quizId) ?

                                            (getQuizStatus(quizId) === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)') : 'white'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = getQuizStatus(quizId) ? 
                                        (getQuizStatus(quizId) === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)') : 'white'}
                                >

                                    <div className="d-flex justify-content-between align-items-center position-relative">
                                        <div className="d-flex align-items-center flex-grow-1 me-5"> {/* Increased margin-end */}
                                            <FaBook className="text-primary me-4"/>
                                            <div className='d-flex flex-column'>
                                            <h6 className="fw-bold">{quizName}</h6>
                                            <span className="text-muted small">
                                                {createdByUserId == userId ? 'Created By You' : createdByUserId == undefined ? '' : `Created By User ${createdByUserId}`}
                                            </span>

                                            {/* Status badge moved here, now inline */}
                                            {getQuizStatus(quizId) && (
                                                <div className={`quiz-status-badge-inline quiz-status-badge-inline-${getQuizStatus(quizId)}`}>
                                                    <span className="quiz-status-icon-inline"></span>
                                                    {getQuizStatus(quizId) === 'completed' ? 'Completed' : 'Attempted'}
                                                </div>
                                            )}
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            
                                            {getDifficultyBadge(difficulty)}
                                            <button 
                                                className="bookmark-button ms-3" 
                                                onClick={(e) => toggleBookmark(quizId, e)}
                                                aria-label={savedQuizzes.includes(quizId) ? "Remove bookmark" : "Add bookmark"}
                                                title={savedQuizzes.includes(quizId) ? "Remove from saved quizzes" : "Add to saved quizzes"}
                                            >
                                                {savedQuizzes.includes(quizId) 
                                                    ? <FaBookmark className="bookmark-icon-filled" size={22} /> 
                                                    : <FaRegBookmark className="bookmark-icon-outline" size={22} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && (
                                        <div 
                                            className="admin-buttons-container mt-3" 
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-primary"
                                                    className="edit-button rounded-pill d-flex align-items-center justify-content-center"
                                                    onClick={(e) => handleEditClick(quizId, e)}
                                                    title="Edit Quiz"
                                                    aria-label="Edit Quiz"
                                                >
                                                    <Edit size={16} className="me-2" /> Edit Quiz
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    className="delete-button rounded-pill d-flex align-items-center justify-content-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent quiz click when deleting
                                                        confirmDelete(quizId, quizName);
                                                    }}
                                                    title="Delete Quiz"
                                                    aria-label="Delete Quiz"
                                                >
                                                    <Trash2 size={16} className="me-2" /> Delete Quiz
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        
                        {quizzes.length === 0 && (
                            <Card.Body className="text-center text-muted py-5">
                                No quizzes available for this topic
                            </Card.Body>
                        )}
                    </Card>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal 
                show={showModal} 
                onHide={closeDeleteModal}
                centered
            >
                <Modal.Header className={
                    deleteStatus === "success" ? "bg-success text-white" : 
                    deleteStatus === "error" ? "bg-danger text-white" : 
                    "border-bottom"
                }>
                    <Modal.Title>
                        {deleteStatus === "idle" && "Confirm Deletion"}
                        {deleteStatus === "loading" && "Deleting Quiz"}
                        {deleteStatus === "success" && "Success"}
                        {deleteStatus === "error" && "Error"}
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body className="py-4">
                    {deleteStatus === "idle" && quizToDelete && (
                        <div className="text-center">
                            <AlertTriangle size={48} className="text-warning mb-3" />
                            <p className="mb-1">Are you sure you want to delete the quiz:</p>
                            <p className="fw-bold mb-3">&quot;{quizToDelete.name}&quot;</p>
                            <p className="text-muted small">This action cannot be undone.</p>
                        </div>
                    )}
                    
                    {deleteStatus === "loading" && (
                        <div className="text-center py-3">
                            <div className="d-inline-block mb-3">
                                <Spinner animation="border" variant="primary" />
                            </div>
                            <p>{deleteMessage}</p>
                        </div>
                    )}
                    
                    {deleteStatus === "success" && (
                        <div className="text-center py-3">
                            <CheckCircle size={48} className="text-success mb-3" />
                            <p>{deleteMessage}</p>
                        </div>
                    )}
                    
                    {deleteStatus === "error" && (
                        <div className="text-center py-3">
                            <XCircle size={48} className="text-danger mb-3" />
                            <p>{deleteMessage}</p>
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer className={
                    deleteStatus === "success" ? "bg-light" : 
                    deleteStatus === "error" ? "bg-light" : 
                    "border-top"
                }>
                    {deleteStatus === "idle" && (
                        <>
                            <Button variant="outline-secondary" onClick={closeDeleteModal}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                <Trash2 size={16} className="me-1" />
                                Delete
                            </Button>
                        </>
                    )}
                    
                    {deleteStatus === "loading" && (
                        <Button variant="outline-secondary" disabled>
                            Processing...
                        </Button>
                    )}
                    
                    {deleteStatus === "success" && (
                        <Button variant="outline-success" onClick={closeDeleteModal}>
                            Close
                        </Button>
                    )}
                    
                    {deleteStatus === "error" && (
                        <>
                            <Button variant="outline-secondary" onClick={closeDeleteModal}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                Try Again
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <style>{`
                .quiz-topic-container {
                    padding: 1rem;
                }
                
                .sub-topics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                
                .quiz-item:last-child {
                    border-bottom: none !important;
                }
                
                .bookmark-button {
                    background: none;
                    border: none;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    background-color: #f0f0f0;
                    width: 40px;
                    height: 40px;
                }
                
                .bookmark-button:hover {
                    background-color: #e0e0e0;
                    transform: scale(1.1);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .bookmark-button:active {
                    transform: scale(0.95);
                }
                
                .bookmark-icon-filled {
                    color: #3a86ff;
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
                }
                
                .bookmark-icon-outline {
                    color: #555;
                }
                
                .delete-button-container {
                    border-top: 1px solid #eee;
                    padding-top: 8px;
                }
                
                .delete-button {
                    transition: all 0.2s ease;
                    font-weight: 500;
                    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
                }
                
                .delete-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
                }
                
                .delete-button:active {
                    transform: translateY(0);
                }
                
                @media (max-width: 576px) {
                    .bookmark-button {
                        width: 36px;
                        height: 36px;
                        padding: 6px;
                    }
                }
                    
                /* New inline status badge styling */
.quiz-status-badge-inline {
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    margin-left: 0.5rem;
    animation: fadeIn 0.3s ease-in-out;
}

.quiz-status-badge-inline-completed {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.quiz-status-badge-inline-attempted {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
}

.quiz-status-icon-inline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin-right: 4px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.25);
}

.quiz-status-badge-inline-completed .quiz-status-icon-inline::before {
    content: '✓';
    font-size: 10px;
    line-height: 1;
}

.quiz-status-badge-inline-attempted .quiz-status-icon-inline::before {
    content: '!';
    font-size: 10px;
    line-height: 1;
}
            `}</style>
        </div>
    );
};

// PropType checking for QMTopicSelection
QMTopicSelection.propTypes = {
    mainTopic: PropTypes.string.isRequired,
    subTopicList: PropTypes.arrayOf(
        PropTypes.shape({
            subTopic: PropTypes.string.isRequired,
            quizzes: PropTypes.arrayOf(
                PropTypes.shape({
                    quizId: PropTypes.number.isRequired,
                    quizName: PropTypes.string.isRequired,
                    difficulty: PropTypes.string.isRequired
                })
            ).isRequired
        })
    ).isRequired,
    savedQuizzes: PropTypes.array.isRequired,
    setSavedQuizzes: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    handleDeleteQuiz: PropTypes.func.isRequired,
    quizId: PropTypes.number
};

export default QMTopicSelection;