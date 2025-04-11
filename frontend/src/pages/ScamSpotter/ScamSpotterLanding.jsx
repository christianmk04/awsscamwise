import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectionCard from '../../components/ScamSpotterQuizMaster/SelectionCard';
import { Container, Row, Col } from 'react-bootstrap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const process_ss_request_url = "http://18.214.76.26:5030/process_ss_request";

const ScamSpotterLanding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Hold on tight, we're setting things up! 🚀");
  const navigate = useNavigate();

  const messages = [
    "Hold on tight, we're setting things up! 🚀",
    "Grabbing your emails... hope they're all good ones! 📬",
    "Fetching your session... no peeking! 👀",
    "Our hamsters are running on the wheel to get this done! 🐹💨",
  ];

  // Change the loading message every 3 seconds
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setMessage(randomMessage);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Call the process_ss_request API to set up the session and get the file path
  const setupSession = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log("Retrieved userId:", userId);
      if (!userId) {
        console.error("User ID not found in localStorage");
        return false;
      }
      
      const response = await fetch(process_ss_request_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "user_id": userId }),
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Session setup successful:", data);
      // Expecting data to include the file path, e.g., { file_path: "http://..." }
      return data.file_path;
    } catch (error) {
      console.error("Error setting up session:", error);
      return false;
    }
  };

  // When a card is clicked, if it's Daily Practice (index === 0), show loading,
  // call the API, wait at least 3 seconds, then navigate to the Daily Practice page.
  const handleNavigation = async (link, index) => {
    if (index === 0) {
      setIsLoading(true);
      const startTime = Date.now();
      
      try {
        const filePath = await setupSession();
        const elapsed = Date.now() - startTime;
        const minimumDelay = 3000; // 3 seconds minimum
        const remainingDelay = Math.max(minimumDelay - elapsed, 0);
        
        setTimeout(() => {
          console.log("Navigating to:", link, "with filePath:", filePath);
          // Navigate and pass the filePath in state
          navigate(link, { state: { filePath } });
          // Fallback navigation in case navigate fails
          setTimeout(() => {
            if (document.location.pathname !== link) {
              window.location.href = link;
            }
          }, 100);
        }, remainingDelay);
      } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = link;
      }
    } else {
      // For other cards, navigate directly without calling the API
      try {
        navigate(link);
        setTimeout(() => {
          if (document.location.pathname !== link) {
            window.location.href = link;
          }
        }, 100);
      } catch (error) {
        console.error("Direct navigation error:", error);
        window.location.href = link;
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#13072e',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '1.5rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        textAlign: 'center'
      }}>
        <div>{message}</div>
      </div>
    );
  }

  return (
    <div className={`page-wrapper bg-light py-5 ${isLoading ? '' : 'fade-in'}`}>
      <Container className="header-container mb-5">
        <Row className="align-items-center">
          <Col xl={1}></Col>
          <Col xl={5} className="hero-text pe-lg-5">
            <div className="slide-up active">
              <h1 className="display-4 fw-bold mb-4">Spot the Scam!</h1>
              <p className="lead text-secondary mb-4">Dive into realistic scam simulations and challenge your skills to become a scam detection expert.</p>          
            </div>
          </Col>
          <Col xl={5} className="position-relative">
            <div className="hero-animation-wrapper">
              <DotLottieReact
                src="https://lottie.host/7402074c-2d41-4d44-9d73-81c2367ac5f8/0Ol4nNzMw1.lottie"
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
            Put your scam detection skills to the test with these interactive exercises
          </p>
        </div>
        
        <Row className="g-4 equal-height-cards">
          {[
            {
              title: 'Daily Practice',
              description: 'Practice with simulation problems tailored specifically to your learning needs',
              icon_url: './public/calendar.png',
              link: "/scam-spotter/daily-practice",
              color: "linear-gradient(135deg, #ff4b2b, #ff416c)"
            },
            {
              title: 'Custom Practice',
              description: 'Select your preferred focus areas and adjust the difficulty to your liking',
              icon_url: './public/package-box.png',
              link: "/scam-spotter/custom-practice",
              color: "linear-gradient(135deg, #11998e, #38ef7d)"
            },
            {
              title: 'Try to Scam Others!',
              description: 'Create a scam email/website for other ScamWisers! A feature coming soon, so stay tuned!',
              icon_url: './public/hacker.png',
              link: "/scam-spotter/scam-creation",
              color: "linear-gradient(135deg, #8e2de2, #4a00e0)"
            }
          ].map((item, index) => (
            <Col 
              key={index} 
              md={12} 
              xxl={4} 
              className={`card-item-wrapper fade-in-up active`} 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  width: '100%',
                  height: '100%' 
                }}
                onClick={() => handleNavigation(item.link, index)}
                className="card-button h-100"
              >
                <SelectionCard
                  title={item.title}
                  description={item.description}
                  icon_url={item.icon_url}
                  color={item.color}
                />
              </button>
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
          background: linear-gradient(135deg, rgba(255, 75, 43, 0.2), rgba(255, 65, 108, 0.2));
          border-radius: 60% 40% 70% 30% / 60% 30% 70% 40%;
          z-index: 1;
        }
        
        .card-button {
          transition: transform 0.3s ease;
        }
        
        .card-button:focus {
          outline: none;
        }
        
        .equal-height-cards {
          display: flex;
          flex-wrap: wrap;
        }
        
        .equal-height-cards > .card-item-wrapper {
          display: flex;
        }
        
        .equal-height-cards .card-button,
        .equal-height-cards .custom-card {
          display: flex;
          flex-direction: column;
          height: 100%;
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

export default ScamSpotterLanding;
