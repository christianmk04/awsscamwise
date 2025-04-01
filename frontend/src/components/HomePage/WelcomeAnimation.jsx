import { useState, useEffect } from 'react';

const WelcomeAnimation = ({ onComplete }) => {
  const [showSecondText, setShowSecondText] = useState(false);

  useEffect(() => {
    // Show second text after first animation
    const showSecondTimer = setTimeout(() => {
      setShowSecondText(true);
    }, 2500);

    // Complete animation after all sequences
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(showSecondTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: '#13072e',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            color: '#fff',
            fontSize: '2.5rem',
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeInOut 2.5s ease-in-out forwards'
          }}
        >
          Ready to Take your Scam Detection Skills<br />to the Next Level?
        </div>
        {showSecondText && (
          <div
            style={{
              position: 'absolute',
              color: '#fff',
              fontSize: '2.5rem',
              textAlign: 'center',
              opacity: 0,
              animation: 'fadeInOut 2.5s ease-in-out forwards'
            }}
          >
            Welcome to <span className='gradient-text'>ScamWise</span>
          </div>
        )}
        <style>
          {`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translateY(20px); }
              20% { opacity: 1; transform: translateY(0); }
              80% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }

            .gradient-text {
              background: linear-gradient(45deg, #89CFF0, #FFB6C1);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-fill-color: transparent;
              display: inline-block;
              font-weight: bold;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default WelcomeAnimation;