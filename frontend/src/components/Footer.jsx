import { Container, Row, Col } from 'react-bootstrap';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (

    // Make footer sticky to the bottom

    <footer className="bg-dark text-light py-4">
      <Container>
        <Row className="gy-4">
          {/* Company Info */}
          <Col md={3}>
            <h5 className="text-white">Code for Singapore (C4SG)</h5>
            <ul className="list-unstyled mt-3">
              <li className="d-flex align-items-center gap-2 mt-2">
                <Phone className="h-5 w-5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="d-flex align-items-center gap-2 mt-2">
                <Mail className="h-5 w-5" />
                <span>contact@company.com</span>
              </li>
            </ul>
          </Col>

          <Col md={3}></Col>
          <Col md={3}></Col>

          {/* Social Media */}
          <Col md={3}>
            <h5 className="text-white">Connect With Us</h5>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-light hover-text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-light hover-text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-light hover-text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-light hover-text-white">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <Row className="border-top border-secondary mt-4 pt-3 text-center">
          <Col>
            <p className="mb-1">© {currentYear} Team Digital Otters. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
