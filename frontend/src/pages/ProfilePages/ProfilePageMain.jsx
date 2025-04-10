import { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Nav, Button, Card, Badge } from 'react-bootstrap';
import QuizCard from '../../components/ProfilePage/QuizCard';
import SavedArticleCard from '../../components/ProfilePage/SavedArticleCard';
import SavedQuizzesCard from '../../components/ProfilePage/SavedQuizzesCard';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ProfilePageMain = () => {
  const [activeKey, setActiveKey] = useState('created_quizzes');
  const [profileDetails, setProfileDetails] = useState(null);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Material/Pastel color palette
  const colors = {
    primary: '#6200ee',    // Deep purple
    secondary: '#03dac6',  // Teal
    background: '#f5f7fa', // Light gray background
    surface: '#ffffff',    // White surface
    accent: '#bb86fc',     // Light purple
    error: '#b00020',      // Error red
    textPrimary: '#333333',
    textSecondary: '#757575',
    cardBg: '#ffffff',
    navActiveBg: '#ede7f6', // Light purple background for active nav
    navActiveText: '#6200ee',
    tabBorder: '#e0e0e0',  // Light gray border
    buttonHover: '#5000d6', // Darker purple for hover
  };

  // Fetch profile details on component mount
  useEffect(() => {
    const fetchProfileDetails = async () => {
      // Get userId from local storage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found.');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch profile details from the backend
        const profileResponse = await fetch('http://172.31.35.32:5002/get_profile_details/' + userId);
        if (!profileResponse.ok) {
          throw new Error(`Error: ${profileResponse.status} ${profileResponse.statusText}`);
        }
        const profileData = await profileResponse.json();
        setProfileDetails(profileData);

        // 2. Fetch user quizzes from the backend
        const quizzesResponse = await fetch('http://172.31.35.32:5004/get_user_quizzes/' + userId);
        if (!quizzesResponse.ok) {
          throw new Error(`Error: ${quizzesResponse.status} ${quizzesResponse.statusText}`);
        }
        const quizzesData = await quizzesResponse.json();
        setUserQuizzes(quizzesData.length === 0 ? [] : quizzesData);

        // 3. Fetch saved articles
        const savedArticlesResponse = await fetch('http://172.31.35.32:5002/get_saved_articles/' + userId);
        if (!savedArticlesResponse.ok) {
          throw new Error(`Error: ${savedArticlesResponse.status} ${savedArticlesResponse.statusText}`);
        }
        const savedArticlesResponseData = await savedArticlesResponse.json();
        
        if (savedArticlesResponseData.length === 0) {
          setSavedArticles([]);
        } else {
          const savedArticles = await Promise.all(
            savedArticlesResponseData.map(async (articleId) => {
              const articleResponse = await fetch('http://172.31.35.32:5009/get_news_by_id/' + articleId);
              if (!articleResponse.ok) {
                throw new Error(`Error: ${articleResponse.status} ${articleResponse.statusText}`);
              }
              return articleResponse.json();
            })
          );
          setSavedArticles(savedArticles);
        } 
        
        // 4. Fetch saved quizzes
        const savedQuizzesResponse = await fetch('http://172.31.35.32:5002/get_saved_quizzes/' + userId);
        if (!savedQuizzesResponse.ok) {
          throw new Error(`Error: ${savedQuizzesResponse.status} ${savedQuizzesResponse.statusText}`);
        }
        const savedQuizzesResponseData = await savedQuizzesResponse.json();

        const savedQuizzes = await Promise.all(
          savedQuizzesResponseData.map(async (quizId) => {
            const quizResponse = await fetch('http://172.31.35.32:5004/get_quiz_details/' + quizId);
            if (!quizResponse.ok) {
              throw new Error(`Error: ${quizResponse.status} ${quizResponse.statusText}`);
            }
            return quizResponse.json();
          })
        );
        setSavedQuizzes(savedQuizzes);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, []);

  const handleRemoveSavedArticle = async (articleId) => {
    try {
      const userId = localStorage.getItem('userId');
      
      const json_body = {
        userId: userId,
        articleId: articleId
      };

      await fetch('http://172.31.35.32:5002/remove_saved_article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json_body)
      });
      setSavedArticles(savedArticles.filter(article => article.newsId !== articleId));
    } catch (error) {
      console.error('Error removing saved article:', error);
    }
  };

  const handleRemoveSavedQuiz = async (quizId) => {
    try {
      const userId = localStorage.getItem('userId');
      
      const json_body = {
        userId: userId,
        quizId: quizId
      };

      await fetch('http://172.31.35.32:5002/remove_saved_quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json_body)
      });
      setSavedQuizzes(savedQuizzes.filter(quiz => quiz.quizId !== quizId));
    } catch (error) {
      console.error('Error removing saved quiz:', error);
    }
  };

  // Function to handle quiz deletion
  const handleDeleteQuiz = (quizId) => {
    setUserQuizzes((prevQuizzes) => {
      const updatedQuizzes = prevQuizzes.filter(quiz => quiz.quizId !== quizId);
      
      // If the deleted quiz is in savedQuizzes, remove it as well
      setSavedQuizzes((prevSavedQuizzes) => {
        const updatedSavedQuizzes = prevSavedQuizzes.filter(quiz => quiz.quizId !== quizId);
        return updatedSavedQuizzes;
      });

      return updatedQuizzes;
    });
  };

  // Custom CSS for the component
  const styles = {
    contentContainer: {
      backgroundColor: colors.background,
      minHeight: '100vh',
      padding: '20px 0'
    },
    profileContainer: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '30px',
      marginBottom: '30px'
    },
    profileImage: {
      width: '120px',
      height: '120px',
      objectFit: 'cover',
      borderRadius: '50%',
      border: `4px solid ${colors.accent}`,
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
    },
    profileName: {
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: '5px'
    },
    profileLevel: {
      color: colors.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    levelBadge: {
      backgroundColor: colors.accent,
      color: '#fff',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.9rem'
    },
    profileButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: '#fff',
      borderRadius: '30px',
      padding: '8px 20px',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
      boxShadow: '0 2px 10px rgba(98, 0, 238, 0.2)'
    },
    itemsContainer: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '30px'
    },
    navItem: {
      marginBottom: '10px'
    },
    navLink: {
      color: colors.textSecondary,
      borderRadius: '8px',
      padding: '12px 15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },
    navLinkActive: {
      backgroundColor: colors.navActiveBg,
      color: colors.navActiveText,
      fontWeight: '600'
    },
    tabContent: {
      paddingLeft: '20px',
      borderLeft: `1px solid ${colors.tabBorder}`
    },
    tabHeading: {
      fontSize: '1.5rem',
      marginBottom: '20px',
      color: colors.textPrimary,
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    createButton: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
      color: colors.textPrimary,
      borderRadius: '30px',
      padding: '8px 20px',
      fontWeight: '500',
      boxShadow: '0 2px 10px rgba(3, 218, 198, 0.2)',
      marginBottom: '20px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    emptyStateMessage: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      color: colors.textSecondary,
      textAlign: 'center',
      border: `1px dashed ${colors.tabBorder}`
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh'
    }
  };

  if (loading) {
    return (
      <div style={styles.contentContainer}>
        <div style={styles.loadingContainer}>
          <DotLottieReact
            src="https://lottie.host/c4ebbe3c-45f7-4cbc-a483-0a4016d9d250/SHoYfui1im.lottie"
            loop
            autoplay
            style={{ maxWidth: '300px', marginBottom: '20px' }}
          />
          <h3 style={{ color: colors.primary, fontWeight: '600' }}>
            Retrieving Profile Details, Please Wait for a Moment!
          </h3>
        </div>  
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.contentContainer}>
        <Container>
          <Card style={{ padding: '30px', backgroundColor: '#fff4f4', border: `1px solid ${colors.error}` }}>
            <Card.Body>
              <h4 style={{ color: colors.error }}>Oops! Something went wrong</h4>
              <p>{error}</p>
              <Button 
                variant="outline-danger"
                onClick={() => window.location.reload()}
                style={{ marginTop: '10px' }}
              >
                Try Again
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  // Functions to determine whether a nav link is active
  const isNavActive = (key) => activeKey === key;
  const getNavLinkStyle = (key) => ({
    ...styles.navLink,
    ...(isNavActive(key) ? styles.navLinkActive : {})
  });

  // Get the correct icon for the tab heading
  const getTabIcon = (key) => {
    switch(key) {
      case 'created_quizzes': return 'quiz';
      case 'scenarios': return 'rebase_edit';
      case 'saved_quizzes': return 'save';
      case 'articles': return 'newspaper';
      case 'friends': return 'group';
      default: return 'quiz';
    }
  };

  // Get the correct heading for the tab
  const getTabHeading = (key) => {
    switch(key) {
      case 'created_quizzes': return 'My Created Quizzes';
      case 'scenarios': return 'My Created Scenarios';
      case 'saved_quizzes': return 'My Saved Quizzes';
      case 'articles': return 'My Saved Articles';
      case 'friends': return 'Friends';
      default: return '';
    }
  };

  return (
    <div style={styles.contentContainer}>
      <Container style={styles.profileContainer}>
        <Row className="align-items-center">
          <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
            <img
              src={profileDetails.profilePicturePath || '/default-profile.png'}
              style={styles.profileImage}
              alt="Profile"
            />
          </Col>
          <Col xs={12} md={7} className="mb-3 mb-md-0">
            <h2 style={styles.profileName}>{profileDetails.fullName || 'User Name'}</h2>
            <div style={styles.profileLevel}>
              <Badge style={styles.levelBadge}>Level {profileDetails.level}</Badge>
              <span>{profileDetails.title}</span>
            </div>
          </Col>
          <Col xs={12} md={3} className="text-md-end">
            <Nav.Link href="/profile/settings">
              <Button style={styles.profileButton}>
                Profile Settings
                <span className="material-symbols-rounded">manage_accounts</span>
              </Button>
            </Nav.Link>
          </Col>
        </Row>
      </Container>

      <Container style={styles.itemsContainer}>
        <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
          <Row>
            <Col xs={12} md={3} className="mb-4 mb-md-0">
              <Card style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}>
                <Card.Body style={{ padding: 0 }}>
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item style={styles.navItem}>
                      <Nav.Link 
                        eventKey="created_quizzes" 
                        style={getNavLinkStyle('created_quizzes')}
                      >
                        <span className="material-symbols-rounded">quiz</span> My Created Quizzes
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item style={styles.navItem}>
                      <Nav.Link 
                        eventKey="scenarios" 
                        style={getNavLinkStyle('scenarios')}
                      > 
                        <span className="material-symbols-rounded">rebase_edit</span>My Created Scenarios
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item style={styles.navItem}>
                      <Nav.Link 
                        eventKey="saved_quizzes" 
                        style={getNavLinkStyle('saved_quizzes')}
                      >
                        <span className="material-symbols-rounded">save</span> My Saved Quizzes
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item style={styles.navItem}>
                      <Nav.Link 
                        eventKey="articles" 
                        style={getNavLinkStyle('articles')}
                      >
                        <span className="material-symbols-rounded">newspaper</span> My Saved Articles
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item style={styles.navItem}>
                      <Nav.Link 
                        eventKey="friends" 
                        style={getNavLinkStyle('friends')}
                      >
                        <span className="material-symbols-rounded">group</span>Friends
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={9}>
              <div style={styles.tabContent}>
                <Tab.Content>
                  {/* Quizzes Tab */}
                  <Tab.Pane eventKey="created_quizzes">
                    <h4 style={styles.tabHeading}>
                      <span className="material-symbols-rounded">{getTabIcon(activeKey)}</span>
                      {getTabHeading(activeKey)}
                    </h4>
                    <Nav.Link href='/quiz-master/quiz-creation' className="d-inline-block">
                      <Button style={styles.createButton}>
                        <span className="material-symbols-rounded">add</span>
                        Create New Quiz
                      </Button>
                    </Nav.Link>

                    {userQuizzes.length === 0 ? (
                      <div style={styles.emptyStateMessage}>
                        <span className="material-symbols-rounded" style={{ fontSize: '48px', opacity: 0.6, marginBottom: '10px' }}>quiz</span>
                        <p>Your created quizzes will display here. Start creating quizzes to share your knowledge and engage with the community!</p>
                      </div>
                    ) : (
                      <Row xs={1} className="g-4">
                        {userQuizzes.map((quiz) => (
                          <Col key={quiz.quizId}>
                            <QuizCard quiz={quiz} onDelete={handleDeleteQuiz} />
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Tab.Pane>

                  {/* Scenarios Tab */}
                  <Tab.Pane eventKey="scenarios">
                    <h4 style={styles.tabHeading}>
                      <span className="material-symbols-rounded">{getTabIcon(activeKey)}</span>
                      {getTabHeading(activeKey)}
                    </h4>
                    <div style={{ ...styles.emptyStateMessage, backgroundColor: '#f1f7ff' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '48px', opacity: 0.6, marginBottom: '10px' }}>upcoming</span>
                      <p>A Feature Coming Soon! Stay Tuned for new updates!</p>
                    </div>
                  </Tab.Pane>

                  {/* Saved Quizzes Tab */}
                  <Tab.Pane eventKey="saved_quizzes">
                    <h4 style={styles.tabHeading}>
                      <span className="material-symbols-rounded">{getTabIcon(activeKey)}</span>
                      {getTabHeading(activeKey)}
                    </h4>
                    {savedQuizzes.length === 0 ? (
                      <div style={styles.emptyStateMessage}>
                        <span className="material-symbols-rounded" style={{ fontSize: '48px', opacity: 0.6, marginBottom: '10px' }}>bookmark</span>
                        <p>Your saved quizzes will display here. Save some quizzes to revisit later on!</p>
                      </div>
                    ) : (
                      <Row xs={1} className="g-4">
                        {savedQuizzes.map(quiz => (
                          <Col key={quiz.quizId}>
                            <SavedQuizzesCard quiz={quiz} onRemove={handleRemoveSavedQuiz} />
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Tab.Pane>

                  {/* Saved Articles Tab */}
                  <Tab.Pane eventKey="articles">
                    <h4 style={styles.tabHeading}>
                      <span className="material-symbols-rounded">{getTabIcon(activeKey)}</span>
                      {getTabHeading(activeKey)}
                    </h4>
                    {savedArticles.length === 0 ? (
                      <div style={styles.emptyStateMessage}>
                        <span className="material-symbols-rounded" style={{ fontSize: '48px', opacity: 0.6, marginBottom: '10px' }}>article</span>
                        <p>Your saved articles will display here. Start saving articles to read them later!</p>
                      </div>
                    ) : (
                      <Row xs={1} className="g-4">
                        {savedArticles.map(article => (
                          <Col key={article.newsId}>
                            <SavedArticleCard article={article} onRemove={handleRemoveSavedArticle} />
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Tab.Pane>

                  {/* Friends Tab */}
                  <Tab.Pane eventKey="friends">
                    <h4 style={styles.tabHeading}>
                      <span className="material-symbols-rounded">{getTabIcon(activeKey)}</span>
                      {getTabHeading(activeKey)}
                    </h4>
                    <div style={{ ...styles.emptyStateMessage, backgroundColor: '#f0f8f1' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '48px', opacity: 0.6, marginBottom: '10px' }}>people</span>
                      <p>Your friends list will be displayed here. Connect with other users to expand your network!</p>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </div>
  );
};

export default ProfilePageMain;