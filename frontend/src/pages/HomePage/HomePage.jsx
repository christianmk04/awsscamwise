import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePageSelectionCard from '../../components/HomePage/HomePageSelectionCard';
import WelcomeAnimation from '../../components/HomePage/WelcomeAnimation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Container, Row, Col, Nav, Card, Badge, Button } from 'react-bootstrap';
import { Calendar, Award, BookOpen, Clock } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  
  const cardItems = [
    {
      title: 'Spot the Scam!',
      description: 'Engage in interactive simulations to hone your scam detection abilities!',
      link: '/scam-spotter',
    },
    {
      title: 'Become a Quiz Master',
      description: 'Attempt Quizzes to improve your knowledge on scam tactics and how to avoid them!',
      link: '/quiz-master',
    },
    {
      title: 'View Your Progress!',
      description: "See how well you've been evading scams with your personalised dashboard!",
      link: '/dashboard',
    },
    {
      title: 'Daily Digest',
      description: 'Keep informed on the latest scam tactics and ways to stay protected',
      link: '/daily-digest',
    },
  ];

  const [userDetails, setUserDetails] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [recommendedQuiz, setRecommendedQuiz] = useState(null);
  const [recommendedNews, setRecommendedNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisited', 'true');
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Get userId from local storage
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');

        console.log('User ID:', userId);
        console.log('User Role:', role);

        // Fetch user details
        const userResponse = await fetch(`http://172.31.17.239:5002/get_user_details_home/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }
        const userData = await userResponse.json();
        localStorage.setItem('role', userData.role);
        setUserDetails(userData);

        // Fetch recommended quiz
        const quizResponse = await fetch(`http://172.31.17.239:5004/get_recommended_quizzes_community/${userId}`);
        if (!quizResponse.ok) {
          throw new Error('Failed to fetch quiz recommendations');
        }
        const quizData = await quizResponse.json();
        if (quizData && quizData.length > 0) {
          setRecommendedQuiz(quizData[0]);
        }

        console.log('Recommended Quiz:', quizData[0]);

        // Fetch news recommendation
        const bookmarkedArticles = userData.savedArticles || [];
        const newsResponse = await fetch('http://172.31.17.239:5009/get_news_recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookmarkedArticles),
        });
        if (!newsResponse.ok) {
          throw new Error('Failed to fetch news recommendations');
        }
        const newsData = await newsResponse.json();
        if (newsData && newsData.length > 0) {
          setRecommendedNews(newsData[newsData.length - 1]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnimationComplete = () => {
    setShowWelcome(false);
  };

  // Function to start a recommended quiz
  const handleStartQuiz = (quiz) => {
    console.log(`Starting quiz with ID: ${quiz.quiz_id}`);
    
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Awareness':
        return 'danger';
      case 'Prevention':
        return 'info';
      case 'Policy and Legal':
        return 'success';
      case 'Case Studies':
        return 'warning';
      case 'Education':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      {showWelcome && <WelcomeAnimation onComplete={handleAnimationComplete} />}
      <div className="content-container m-0 p-0">
        {/* Hero section with gradient background */}
        <div className="hero-section py-5" style={{ 
          background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
          color: 'white',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <Container fluid className="welcome-container mx-auto">
            <Row className="align-items-center">
              <Col xl={1}></Col>
              <Col xl={5} className="d-flex flex-column justify-content-center">
                <h1 className="mb-4 fs-1 fw-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Welcome Back, {userDetails.fullName || 'User'} 👋🏻
                </h1>
                <div className="d-flex flex-wrap gap-4">
                  <div className="d-flex align-items-center p-3" style={{ 
                    background: 'rgba(255,255,255,0.15)', 
                    borderRadius: '10px',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <Calendar size={24} className="me-2" />
                    <div>
                      <div className="text-white-50 fs-6">Activity Streak</div>
                      <div className="fs-5 fw-bold">{userDetails.activityStreak || 0} Days 🔥</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center p-3" style={{ 
                    background: 'rgba(255,255,255,0.15)', 
                    borderRadius: '10px',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <Award size={24} className="me-2" />
                    <div>
                      <div className="text-white-50 fs-6">Total XP</div>
                      <div className="fs-5 fw-bold">{(userDetails.spotterXP + userDetails.quizXP) || 0} ✨</div>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xl={5} className="text-center py-4">
                <DotLottieReact
                  src="https://lottie.host/86035a53-d342-4194-b74f-efb025ba20da/Pf2x9LKAuJ.lottie"
                  loop
                  autoplay
                  className="w-75 h-auto mx-auto"
                />
                <h2 className="fw-bold mt-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Ready to level up your <span style={{ 
                    textDecoration: 'underline', 
                    textDecorationColor: '#FFD700',
                    textDecorationThickness: '3px'
                  }}>scam detection skills?</span>
                </h2>
              </Col>
              <Col xl={1}></Col>
            </Row>
          </Container>
        </div>

        {/* Recommendation sections */}
        <Container fluid className="my-5">
          <Row>
            <Col xl={1}></Col>
            <Col xl={10}>
              <Row className="g-4">
                {/* Quiz recommendation */}
                <Col md={6}>
                  <div className="recommendation-section p-4" style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
                    height: '100%'
                  }}>
                    <h3 className="fw-bold mb-4">
                      <BookOpen size={28} className="me-2 text-primary" />
                      Try out a quiz for today
                    </h3>
                    
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : recommendedQuiz ? (
                      <Card className="border-0 h-100" style={{ 
                        background: 'white', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        borderRadius: '8px',
                        transition: 'transform 0.3s',
                        cursor: 'pointer'
                      }} 
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start">
                            <Badge bg={getDifficultyColor(recommendedQuiz.difficulty)} className="mb-2">
                              {recommendedQuiz.difficulty}
                            </Badge>
                            <Badge bg="secondary">{recommendedQuiz.xp} XP</Badge>
                          </div>
                          <Card.Title className="fw-bold fs-4 mb-3">
                            {recommendedQuiz.quiz_name}
                          </Card.Title>
                          <div className="mb-2 text-muted">
                            <strong>Topic:</strong> {recommendedQuiz.topic}
                          </div>
                          <div className="mb-3 text-muted">
                            <strong>Subtopic:</strong> {recommendedQuiz.subtopic}
                          </div>
                          <div className="mt-auto">
                            <Button 
                              variant="primary" 
                              className="w-100 py-2 mt-2"
                              onClick={() => handleStartQuiz(recommendedQuiz)}
                            >
                              Start Quiz
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ) : (
                      <Card className="border-0 text-center p-4">
                        <Card.Body>
                          <p>No quiz recommendations available. Check back later!</p>
                          <Button variant="outline-primary" href="/quiz-master">Browse All Quizzes</Button>
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </Col>
                
                {/* News recommendation */}
                <Col md={6}>
                  <div className="recommendation-section p-4" style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
                    height: '100%'
                  }}>
                    <h3 className="fw-bold mb-4">
                      <Clock size={28} className="me-2 text-primary" />
                      Read something new today
                    </h3>
                    
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : recommendedNews ? (
                      <Card className="border-0 h-100" style={{ 
                        background: 'white', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        borderRadius: '8px',
                        transition: 'transform 0.3s',
                        cursor: 'pointer'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Badge bg={getCategoryColor(recommendedNews.topicCategory)}>
                              {recommendedNews.topicCategory}
                            </Badge>
                            <small className="text-muted">{formatDate(recommendedNews.date)}</small>
                          </div>
                          <Card.Title className="fw-bold fs-4 mb-3">
                            {recommendedNews.title}
                          </Card.Title>
                          <Card.Text className="text-muted mb-4">
                            {recommendedNews.contentSummary}
                          </Card.Text>
                          <div className="mt-auto">
                            <Button 
                              variant="outline-primary" 
                              className="w-100 py-2 mt-2"
                              href={recommendedNews.urlPath}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Read Full Article
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ) : (
                      <Card className="border-0 text-center p-4">
                        <Card.Body>
                          <p>No news recommendations available. Check back later!</p>
                          <Button variant="outline-primary" href="/daily-digest">Browse All Articles</Button>
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </Col>
              </Row>
            </Col>
            <Col xl={1}></Col>
          </Row>
        </Container>

        {/* Main navigation cards */}
        <Container fluid className="items-container mx-auto my-5">
          <Row>
            <Col xl={1}></Col>
            <Col xl={10} className="selection-cards mx-3">
              <h3 className="fw-bold mb-4">What would you like to do today?</h3>
              <Row xs={1} md={2} className="g-4">
                {cardItems.map((item, index) => (
                  <Col key={index}>
                    <Nav.Link href={item.link} className="text-decoration-none">
                      <div style={{
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }}
                      >
                        <HomePageSelectionCard
                          title={item.title}
                          description={item.description}
                          icon={item.icon}
                        />
                      </div>
                    </Nav.Link>
                  </Col>
                ))}
              </Row>
            </Col>   
            <Col xl={1}></Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default HomePage;