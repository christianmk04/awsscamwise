import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import QMTopicSelection from '../../components/ScamSpotterQuizMaster/QMTopicSelection';
import { motion } from 'framer-motion';

const QMCommunityQuizzes = () => {
  const [quizData, setQuizData] = useState([]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState([]);
  const [userQuizSessions, setUserQuizSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      
      try {
        // Fetch quiz data
        const quizResponse = await fetch('http://0.0.0.0:5004/get_user_quizzes_details');
        if (!quizResponse.ok) {
          throw new Error('Failed to fetch quiz data');
        }
        const quizData = await quizResponse.json();
        console.log(quizData);
        setQuizData(quizData);
        
        // Fetch saved quizzes
        const savedResponse = await fetch(`http://0.0.0.0:5002/get_saved_quizzes/${userId}`);
        if (!savedResponse.ok) {
          throw new Error('Failed to fetch saved quizzes');
        }
        const savedData = await savedResponse.json();
        
        if (savedData === null) {
          setSavedQuizzes([]);
        } else {
          setSavedQuizzes(savedData);
        }

        // Fetch recommended quizzes
        setIsRecommendationsLoading(true);
        const recommendedResponse = await fetch(`http://0.0.0.0:5004/get_recommended_quizzes_community/${userId}`);
        if (!recommendedResponse.ok) {
          throw new Error('Failed to fetch recommended quizzes');
        }
        const recommendedData = await recommendedResponse.json();
        setRecommendedQuizzes(recommendedData);
        setIsRecommendationsLoading(false);

        // Fetch user quiz sessions
        const sessionsResponse = await fetch(`http://0.0.0.0:5006/get_user_quiz_sessions/${userId}`);
        if (!sessionsResponse.ok) {
          throw new Error('Failed to fetch user quiz sessions');
        }
        const sessionsData = await sessionsResponse.json();
        setUserQuizSessions(sessionsData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if user is admin
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole === "admin") {
      setIsAdmin(true);
    }
  }, []);

  // Get all unique categories from quiz data
  const categories = ['all', ...new Set(quizData.map(quiz => {
    // This is a simple categorization based on the first word of the main topic
    const firstWord = quiz.mainTopic.split(' ')[0].toLowerCase();
    return firstWord;
  }))];

  // Enhanced search function to search through topics, subtopics, and quiz names
  const filteredQuizData = quizData.filter(quiz => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // Search in main topic (quiz name)
    const matchesMainTopic = quiz.mainTopic.toLowerCase().includes(searchTermLower);
    
    // Search in subtopics - improved to handle different subtopic formats
    const matchesSubTopic = quiz.subTopicList.some(subTopic => {
      if (typeof subTopic === 'string') {
        return subTopic.toLowerCase().includes(searchTermLower);
      } else if (subTopic && typeof subTopic === 'object') {
        // Check if subTopic is an object with subTopic property
        return subTopic.subTopic && subTopic.subTopic.toLowerCase().includes(searchTermLower);
      }
      return false;
    });
    
    // Combined search results
    const matchesSearch = matchesMainTopic || matchesSubTopic;
    
    // Category filter remains the same
    const matchesCategory = selectedCategory === 'all' || 
      quiz.mainTopic.toLowerCase().startsWith(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // Difficulty badge helper
  const getDifficultyBadgeClass = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner':
        return 'difficulty-beginner';
      case 'intermediate':
        return 'difficulty-intermediate';
      case 'advanced':
        return 'difficulty-advanced';
      default:
        return 'difficulty-intermediate';
    }
  };

  // Function to start a recommended quiz
  const handleStartQuiz = (quizId) => {
    // Add your navigation logic here
    console.log(`Starting quiz with ID: ${quizId}`);
    
    // Get the quiz details from the quizData array
    const quiz = recommendedQuizzes.find(quiz => quiz.quiz_id === quizId);
    const quizData = {
      mainTopic: quiz.topic,
      subTopic: quiz.subtopic,
      quizName: quiz.quiz_name,
      difficulty: quiz.difficulty,
      quizId: quiz.quiz_id
    };

    // Navigate to the quiz page with the quiz data
    navigate('/quiz-master/quiz-page', { state: quizData });
  };

  // Function to delete a quiz
  const handleDeleteQuiz = async (quizId) => {
    try {
      const response = await fetch(`http://0.0.0.0:5004/delete_quiz/${quizId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      
      // Update quizData by filtering out the deleted quiz
      setQuizData(prevQuizData => prevQuizData.filter(quiz => quiz.quiz_id !== quizId));
      
      // Also update the recommendedQuizzes if the deleted quiz is in there
      setRecommendedQuizzes(prevRecommendedQuizzes => 
        prevRecommendedQuizzes.filter(quiz => quiz.quiz_id !== quizId)
      );
      
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  return (
    <div className="custom-practice-container min-vh-100">
      {/* Custom CSS */}
      <style>
        {`
          .custom-practice-container {
            background: linear-gradient(120deg, #f8f9fa 0%, #e0f2fe 100%);
            padding: 2rem 0;
          }
          
          .hero-card {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
          }
          
          .hero-dots {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 30%;
            background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
            background-size: 15px 15px;
          }
          
          .hero-text {
            color: white;
            position: relative;
            z-index: 2;
          }
          
          .search-container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            padding: 1.5rem;
            margin-top: -2rem;
            position: relative;
            z-index: 10;
          }
          
          .search-input {
            border-radius: 50px;
            border: 2px solid #e5e7eb;
            padding: 0.75rem 1.5rem;
            transition: all 0.2s;
          }
          
          .search-input:focus {
            border-color:rgb(136, 179, 248);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          
          .category-btn {
            border-radius: 50px;
            padding: 0.5rem 1rem;
            background-color: #f3f4f6;
            border: none;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .category-btn.active {
            background-color: #3b82f6;
            color: white;
          }
          
          .topic-card {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s, box-shadow 0.3s;
            border: none;
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .topic-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          .topic-card-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .difficulty-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            display: inline-block;
          }
          
          .difficulty-beginner {
            background-color: #dcfce7;
            color: #16a34a;
          }
          
          .difficulty-intermediate {
            background-color: #fef9c3;
            color: #ca8a04;
          }
          
          .difficulty-advanced {
            background-color: #fee2e2;
            color: #dc2626;
          }
          
          .progress-small {
            height: 6px;
            border-radius: 3px;
          }
          
          .topic-tag-topic {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background-color:rgb(198, 229, 247);
            color:rgb(12, 13, 3);
            border-radius: 50px;
            font-size: 0.875rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .topic-tag-subtopic {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background-color:rgb(236, 218, 250);
            color:rgb(12, 14, 18);
            border-radius: 50px;
            font-size: 0.875rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s ease-in-out infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .error-alert {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
          }
          
          .empty-state {
            text-align: center;
            padding: 3rem;
            background-color: white;
            border-radius: 12px;
          }
          
          .recommended-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
          }
          
          .recommended-section::before {
            content: '';
            position: absolute;
            top: -5%;
            right: -5%;
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%);
            border-radius: 50%;
            opacity: 0.1;
          }
          
          .recommended-card {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s, box-shadow 0.3s;
            border: none;
            height: 100%;
            overflow: hidden;
          }
          
          .recommended-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .rec-card-tag {
            position: absolute;
            top: 0;
            right: 0;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            border-bottom-left-radius: 8px;
          }
          
          .start-quiz-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            font-weight: 500;
            transition: all 0.3s;
          }
          
          .start-quiz-btn:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
          
          .xp-badge {
            background-color: #f0f9ff;
            color: #3b82f6;
            font-weight: 600;
            border-radius: 50px;
            padding: 0.25rem 0.75rem;
            font-size: 0.875rem;
          }
          
          @@media (max-width: 992px) {
            .search-container {
              margin-top: 1rem;
            }
          }
        `}
      </style>

      <Container>
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-card mb-4"
        >
          <Row className="g-0">
            <Col lg={7} className="p-4 p-lg-5">
              <div className="hero-text">
                <h1 className="display-5 fw-bold mb-3">Community-Made Quizzes</h1>
                <p className="fs-5 opacity-90 mb-0">
                    Welcome to the Community-Made Quizzes page! Here, you can find quizzes made by other users. Select a topic from the ones listed below to see the quizzes available for that topic!
                </p>
              </div>
            </Col>
            <Col lg={5} className="position-relative">
              <div className="hero-dots"></div>
              <DotLottieReact
                src="https://lottie.host/f76baf83-89b7-4e29-bc17-2af030e172cf/kwuGn54GC3.lottie"
                loop
                autoplay
                className="w-100 h-100"
              />
            </Col>
          </Row>
        </motion.div>

        {/* Recommended Quizzes Section */}
        {!isRecommendationsLoading && recommendedQuizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="recommended-section mb-4"
          >
            <div className="d-flex align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">Recommended for You</h3>
                <p className="text-muted mb-0">Personalized quizzes based on your interests and skill level</p>
              </div>
            </div>

            <Row className="g-4">
              {recommendedQuizzes.map((quiz, index) => (
                <Col md={6} key={index}>
                  <Card className="recommended-card position-relative h-100">
                    <span className="rec-card-tag">Recommended</span>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start my-3">
                        <span className={`difficulty-badge ${getDifficultyBadgeClass(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        <span className="xp-badge">
                          <i className="bi bi-star-fill me-1"></i>
                          {quiz.xp} XP
                        </span>
                      </div>
                      
                      <h4 className="fw-bold mb-2">{quiz.quiz_name}</h4>
                      
                      <div className="mb-3">
                        <span className="topic-tag-topic">
                          Main Topic: <b>{quiz.topic}</b> 
                        </span>
                        <span className="topic-tag-subtopic">
                          Sub Topic: <b>{quiz.subtopic}</b> 
                        </span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <button 
                          className="start-quiz-btn"
                          onClick={() => handleStartQuiz(quiz.quiz_id)}
                        >
                          <i className="bi bi-play-fill"></i>
                          Go to Quiz
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="search-container mb-5"
        >
          <Row className="align-items-center">
            <Col>
              <div className="position-relative">
                <i className="bi bi-search position-absolute" style={{ left: '20px', top: '15px' }}></i>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="🔎 Search topics, subtopics, and quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          <div className="mt-4">
            <p className="text-muted mb-2">Filter by category:</p>
            <div className="d-flex flex-wrap">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="error-alert mb-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-circle text-danger me-2 fs-4"></i>
              <div>
                <p className="mb-0 fw-medium">Error loading content</p>
                <p className="mb-0 small">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div>
            <h3 className="fw-bold mb-4">Available Practice Topics</h3>

            <Row className="g-4">
              {filteredQuizData.map((quiz, index) => {
                return (
                  <Col md={6} lg={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="h-100"
                    >
                      <div className="topic-card">
                        <div className="p-4 topic-card-content">    
                          <Row className="h-100">
                            <QMTopicSelection
                              mainTopic={quiz.mainTopic}
                              subTopicList={quiz.subTopicList}
                              savedQuizzes={savedQuizzes}
                              setSavedQuizzes={setSavedQuizzes}
                              isAdmin={isAdmin}
                              handleDeleteQuiz={handleDeleteQuiz}
                              userQuizSessions={userQuizSessions}
                            />
                          </Row>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default QMCommunityQuizzes;