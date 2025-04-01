import { Container, Row, Col, Card } from 'react-bootstrap';
import { Shield, Award, BarChart, Users } from 'lucide-react';

const About = () => {
  return (
    <>
      {/* Custom Styles */}
      <style>
        {`
        .banner-img {
            height: 60vh;
            object-fit: cover;
            filter: brightness(40%);
        }
        
        .feature-icon {
            background-color: #f8f9fa;
            border-radius: 50%;
            padding: 15px;
            display: inline-flex;
            margin-bottom: 20px;
            color: #0d6efd;
        }
        
        .section-divider {
            height: 4px;
            background: linear-gradient(90deg, #0d6efd, #6610f2);
            width: 80px;
            margin: 40px auto;
            border-radius: 2px;
        }
        
        .feature-card {
            height: 100%;
            transition: transform 0.3s ease;
            border-left: 4px solid #0d6efd;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .about-section {
            padding: 60px 0;
        }
        
        .highlight-text {
            color: #0d6efd;
            font-weight: bold;
        }
        `}
      </style>

      {/* Banner Section with Overlay Gradient */}
      <div className="position-relative">
        <img 
          src="/banner.jpg" 
          alt="Cybersecurity Banner" 
          className="w-100 banner-img" 
        />
        <div 
          className="position-absolute top-0 start-0 w-100 h-100" 
          style={{ background: 'linear-gradient(135deg, rgba(105, 157, 235, 0.7) 0%, rgba(102,16,242,0.4) 100%)' }}
        ></div>
        <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
          <h1 className="fw-bold display-3">About ScamWise</h1>
          <p className="lead mt-3 mb-4">Your shield against email scams and phishing attempts</p>
        </div>
      </div>

      {/* Extension Section */}
      <section className="about-section bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="fw-bold mb-4">ScamWise Browser Extension</h2>
              <p className="lead mb-4">Protecting your inbox with advanced AI detection</p>
              <p>
                In a world where phishing attempts and scam emails are on the rise, staying secure is more critical than ever. Our Scam Email Detector browser extension is designed to provide <span className="highlight-text">peace of mind</span> by helping users identify potentially malicious emails with ease.
              </p>
              <p>
                When enabled, this powerful tool works seamlessly across popular email services like Gmail. It scans the contents of incoming emails, including the sender&apos;s email address, subject lines, and body text, leveraging <span className="highlight-text">advanced machine learning models</span> to analyze and evaluate their authenticity.
              </p>
              <p>
                The extension assigns a Scam Likelihood Score to each email, giving users a clear and actionable indicator of whether the email is likely legitimate or a potential scam.
              </p>
            </Col>
            <Col lg={6} className="text-center">
              <img 
                src="/extension-demo.jpg" 
                alt="ScamWise Extension Demo" 
                className="img-fluid rounded shadow-lg" 
                style={{ maxWidth: '80%' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <div className="section-divider"></div>

      {/* Learning Platform Section */}
      <section className="about-section">
        <Container>
          <Row className="mb-5">
            <Col lg={12} className="text-center">
              <h2 className="fw-bold">ScamWise Learning Platform</h2>
              <p className="lead">Empowering individuals to stay vigilant and informed</p>
            </Col>
          </Row>
          
          <Row className="mb-5">
            <Col lg={12}>
              <p className="text-center mb-5">
                Our Scam Email Learning Platform enhances your awareness and skills in identifying and preventing email-based fraud through interactive and engaging features.
              </p>
            </Col>
          </Row>

          <Row>
            {/* Feature 1 */}
            <Col lg={3} md={6} className="mb-4">
              <Card className="feature-card p-4 h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">
                    <Shield size={24} />
                  </div>
                  <h4>Detection Exercises</h4>
                  <p>Practice identifying red flags in fake emails. Analyze sender details, suspicious links, and content to hone your scam detection skills.</p>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Feature 2 */}
            <Col lg={3} md={6} className="mb-4">
              <Card className="feature-card p-4 h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">
                    <Award size={24} />
                  </div>
                  <h4>Interactive Quizzes</h4>
                  <p>Test your knowledge with quizzes that cover scam prevention strategies and enhance your understanding of online threats.</p>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Feature 3 */}
            <Col lg={3} md={6} className="mb-4">
              <Card className="feature-card p-4 h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">
                    <BarChart size={24} />
                  </div>
                  <h4>Progress Dashboard</h4>
                  <p>Track your improvement over time. See how you perform in detection exercises and monitor successfully flagged scam emails.</p>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Feature 4 */}
            <Col lg={3} md={6} className="mb-4">
              <Card className="feature-card p-4 h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">
                    <Users size={24} />
                  </div>
                  <h4>Community Connection</h4>
                  <p>Join a growing network of like-minded individuals. Share insights, learn from others, and build collective resilience.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 m bg-primary text-white text-center">
        <Container>
          <h3 className="mb-4">Ready to protect yourself against phishing?</h3>
          <Row className="justify-content-center">
            <Col md={6} lg={4}>
              <Card className="border-0 bg-white text-dark p-4">
                <Card.Body>
                  <h4 className="mb-3">Get ScamWise Today</h4>
                  <p>Join thousands of users who trust ScamWise for their email security</p>
                  <button className="btn btn-primary mt-2">Download Extension</button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default About;