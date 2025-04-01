import SelectionCard from '../../components/ScamSpotterQuizMaster/SelectionCard';
import { Container, Row, Col } from 'react-bootstrap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useState, useEffect } from 'react';

const QuizMasterLanding = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const cardItems = [
    {
      title: 'Daily Quiz!',
      description:
        'Attempt a short daily quiz featuring different topics about scam prevention!',
      icon_url: './public/calendar.png',
      link: "/quiz-master/daily-practice",
      color: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
      title: 'Custom Topics',
      description:
        'Choose your preferred topics and difficulty to improve on specific topics!',
      icon_url: './public/choice.png',
      link: "/quiz-master/custom-practice",
      color: "linear-gradient(135deg, #6a11cb, #2575fc)"
    },
    {
      title: 'User-Created Quizzes',
      description:
        'Try your hands at quizzes created by other ScamWisers! Some quizzes may be challenging, so be prepared!',
      icon_url: './public/online-community.png',
      link: "/quiz-master/community-quizzes",
      color: "linear-gradient(135deg, #f093fb, #f5576c)"
    },
    {
      title: 'Educate Others!',
      description:
        "Submit a curated quiz to help fellow ScamWiser's improve their scam prevention knowledge!",
      icon_url: './public/study.png',
      link: "/quiz-master/quiz-creation",
      color: "linear-gradient(135deg, #43e97b, #38f9d7)"
    },
  ];

  return (
    <div className={`page-wrapper bg-light py-5 ${isLoaded ? 'fade-in' : ''}`}>
      <Container className="header-container mb-5">
        <Row className="align-items-center">
          <Col xl={1}></Col>
          <Col xl={5} className="hero-text pe-lg-5">
            <div className={`slide-up ${isLoaded ? 'active' : ''}`}>
              <h1 className="display-4 fw-bold mb-4">Become a Quiz Master!</h1>
              <p className="lead text-secondary mb-4">Test your knowledge, challenge yourself, and join our community in the fight against online scams. We have many different quizzes below to hone your skills!</p>
            </div>
          </Col>

          <Col xl={5} className="position-relative">
            <div className="hero-animation-wrapper">
              <DotLottieReact
                src="https://lottie.host/9938e89d-1dd8-4d41-aed7-5664184eaf80/jR2pRSuXVe.lottie"
                loop
                autoplay
                className="w-100 h-auto mx-auto hero-animation"
              />
              <div className="blob-shape"></div>
            </div>
          </Col>
          <Col xl={1}></Col>
        </Row>
      </Container>

      <Container className="selection-container pt-4">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Choose Your Challenge</h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '700px' }}>
            Choose your preferred challenge style and start learning today!
          </p>
        </div>
        
        <Row className="g-4">
          {cardItems.map((item, index) => (
            <Col 
              key={index} 
              sm={12} 
              md={6} 
              xxl={3} 
              className={`card-item-wrapper fade-in-up ${isLoaded ? 'active' : ''}`} 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SelectionCard
                title={item.title}
                description={item.description}
                icon_url={item.icon_url}
                link={item.link}
                color={item.color}
              />
            </Col>
          ))}
        </Row>

      </Container>
      
      <style>{`
        .page-wrapper {
          min-height: 100vh;
        }
        
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease-in forwards;
          animation-delay: 0.2s;
        }
        
        .fade-in-up.active {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .slide-up {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .slide-up.active {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.8s ease-out;
        }
        
        .hero-text {
          position: relative;
          z-index: 2;
        }
        
        .hero-animation-wrapper {
          position: relative;
          padding: 20px;
        }
        
        .hero-animation {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
        }
        
        .blob-shape {
          position: absolute;
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          border-radius: 60% 40% 70% 30% / 60% 30% 70% 40%;
          z-index: 1;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default QuizMasterLanding;