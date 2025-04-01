import React, { useState, useEffect } from 'react';
import { Target, Timer, Trophy, Home, BookOpen } from 'lucide-react';
import { Container, Card, Button } from 'react-bootstrap';
import './SessionPerformance.css';

const SessionPerformance = ({ 
  compliment, 
  bonus_xps, 
  accuracy, 
  time_compliment, 
  raw_score,
  hint_penalty // Pass as hintsUsed * 5 from the parent
}) => {
  const [step, setStep] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [showBonusVisual, setShowBonusVisual] = useState(false);
  const [showPenaltyVisual, setShowPenaltyVisual] = useState(false);
  const [displayedCompliment, setDisplayedCompliment] = useState('');
  const [showCompliment, setShowCompliment] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  
  useEffect(() => {
    const baseScore = parseInt(raw_score) || 0;
    const bonusScore = parseInt(bonus_xps) || 0;
    const penalty = parseInt(hint_penalty) || 0;
    
    const intermediateScore = baseScore + bonusScore; // After bonus addition
    const finalScore = Math.max(0, intermediateScore - penalty); // Final score after penalty
    
    // Reveal labels sequentially
    const accuracyTimeout = setTimeout(() => setStep(1), 500);
    const timeTimeout = setTimeout(() => setStep(2), 1000);
    const scoreLabelTimeout = setTimeout(() => setStep(3), 1500);
    
    // Phase 1: Animate Base Score (0 -> baseScore)
    const phase1Timeout = setTimeout(() => {
      let currentScore = 0;
      const phase1Interval = setInterval(() => {
        if (currentScore < baseScore) {
          currentScore++;
          setDisplayScore(currentScore);
        } else {
          clearInterval(phase1Interval);
          // Phase 2: Animate Bonus Addition (baseScore -> intermediateScore)
          setShowBonusVisual(true);
          let bonusCurrentScore = baseScore;
          const phase2Interval = setInterval(() => {
            if (bonusCurrentScore < intermediateScore) {
              bonusCurrentScore++;
              setDisplayScore(bonusCurrentScore);
            } else {
              clearInterval(phase2Interval);
              // Pause before starting penalty subtraction
              setTimeout(() => {
                setShowBonusVisual(false);
                // Show penalty visual with a custom message
                setShowPenaltyVisual(true);
                // Phase 3: Animate Penalty Subtraction (intermediateScore -> finalScore)
                const phase3Interval = setInterval(() => {
                  if (bonusCurrentScore > finalScore) {
                    bonusCurrentScore--;
                    setDisplayScore(bonusCurrentScore);
                  } else {
                    clearInterval(phase3Interval);
                    // Hide penalty visual after a short delay and then show compliment
                    setTimeout(() => {
                      setShowPenaltyVisual(false);
                      setShowCompliment(true);
                    }, 500);
                  }
                }, 40);
              }, 1000); // 1 second pause before penalty phase
            }
          }, 40);
        }
      }, 40);
    }, 2000);
    
    return () => {
      clearTimeout(accuracyTimeout);
      clearTimeout(timeTimeout);
      clearTimeout(scoreLabelTimeout);
      clearTimeout(phase1Timeout);
    };
  }, [raw_score, bonus_xps, hint_penalty]);

  // Typing effect for the compliment message
  useEffect(() => {
    if (showCompliment && compliment) {
      let index = 0;
      setDisplayedCompliment('');
      const interval = setInterval(() => {
        if (index < compliment.length) {
          setDisplayedCompliment(compliment.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          // After compliment is fully displayed, show navigation buttons after a delay.
          setTimeout(() => {
            setShowNavigation(true);
          }, 1500);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [showCompliment, compliment]);

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: '#0f001e' }}
    >
      <Card
        style={{
          width: '20rem',
          border: '4px solid #ff0080',
          borderRadius: '1.5rem',
          backgroundColor: '#210f3d',
          boxShadow: '0 0 10px #ff0080, 0 0 20px #ff0080',
          color: '#fff',
          position: 'relative'
        }}
        className="p-4 text-center session-card"
      >
        <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Your Results</h2>

        {/* Accuracy */}
        {step >= 1 && accuracy && (
          <div className="slam d-flex align-items-center mb-4">
            <div style={{ width: '3rem' }}>
              <Target size={32} color="#ff0080" />
            </div>
            <div className="text-start ms-2">
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Accuracy</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                {accuracy}
              </div>
            </div>
          </div>
        )}

        {/* Response Time */}
        {step >= 2 && time_compliment && (
          <div className="slam d-flex align-items-center mb-4">
            <div style={{ width: '3rem' }}>
              <Timer size={32} color="#00fff7" />
            </div>
            <div className="text-start ms-2">
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Response Time</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                {time_compliment}
              </div>
            </div>
          </div>
        )}

        {/* Total Earned */}
        {step >= 3 && (
          <div className="slam d-flex align-items-center mb-4">
            <div style={{ width: '3rem' }}>
              <Trophy size={32} color="#fff600" />
            </div>
            <div className="text-start ms-2">
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Total Earned</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                {displayScore}
              </div>
            </div>
          </div>
        )}

        {/* Bonus XP Visual */}
        {showBonusVisual && bonus_xps && (
          <div className="fly-bonus">Bonus Awarded: +{bonus_xps} XP</div>
        )}

        {/* Penalty XP Visual */}
        {showPenaltyVisual && hint_penalty && (
          <div className="fly-penalty">Hint Penalty: -{hint_penalty} XP</div>
        )}

        {/* Compliment Message */}
        {showCompliment && compliment && (
          <div className="fly-compliment">
            <span>{displayedCompliment}</span>
          </div>
        )}
      </Card>

      {/* Navigation Buttons and Quirky Comment */}
      {showNavigation && (
        <div className="navigation-container">
          <p className="quirky-comment">
            Feeling adventurous? Dive into our guide for more tips!
          </p>
          <div className="nav-buttons">
            <Button 
              variant="primary" 
              onClick={() => window.location.href ='/'} 
              className="round-button"
            >
              <Home size={24} color="#00fff7" />
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => window.location.href = '/ssguide'} 
              className="round-button"
            >
              <BookOpen size={24} color="#00fff7" />
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SessionPerformance;
