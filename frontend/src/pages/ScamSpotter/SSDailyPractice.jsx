import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EmailAuthData from "../../components/ScamSpotterEmail/EmailAuthData";
import Toggle from "../../components/ScamSpotterEmail/Toggle";
import { Container, Row, Col, Badge, Toast } from "react-bootstrap";
import EmailTemplate from "/src/components/ScamSpotterEmail/EmailTemplate.jsx";
import Persona from "../../components/ScamSpotterEmail/Persona";
import VerdictButtons from "../../components/ScamSpotterEmail/YourVerdict.jsx";
import SessionPerformance from "../../components/ScamSpotterEmail/PerformanceCard.jsx";
import HintInformationModal from "../../components/ScamSpotterEmail/HintSelectionModal";
import './QuestionCounter.css';

const SSPractice = () => {
  const { state } = useLocation();
  const filePath = state?.filePath;

  const [mode, setMode] = useState("inspect");
  const [emailData, setEmailData] = useState(null);
  const [emailIndex, setEmailIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sessionClosureData, setSessionClosureData] = useState(null);
  
  // Hint system states
  const [showHintModal, setShowHintModal] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const maxHints = 5;
  
  // Hint feedback toast
  const [showHintFeedback, setShowHintFeedback] = useState(false);
  const [hintFeedbackMessage, setHintFeedbackMessage] = useState("");
  const [hintFeedbackType, setHintFeedbackType] = useState("info");
  
  // New states to track verdict and explanations status
  const [verdictSubmitted, setVerdictSubmitted] = useState(false);
  const [explanationsComplete, setExplanationsComplete] = useState(false);
  const [showLimitToast, setShowLimitToast] = useState(false);


  // Custom toggle function for mode changes
  const handleModeChange = (newMode) => {
    setMode(newMode);
  };
  
  const handleElementClick = (element) => {
    // Don't register clicks if verdict has been submitted for this email
    if (mode === "select" && verdictSubmitted) {
      // Early return if user has already submitted verdict for this email
      return;
    }
    
    if (mode === "select") {
      if (hintsUsed >= maxHints) {
        setShowLimitToast(true); // Show warning toast
        return; // Stop further processing
      }
  
      // Increment hints used (each new click counts as a hint)
      setHintsUsed((prev) => prev + 1);
  
      // Apply color change only if a hint is available
      const isMalicious = element.is_malicious || false;
      if (isMalicious) {
        setHintFeedbackMessage("ALERT: Malicious element detected!");
        setHintFeedbackType("danger");
        document.getElementById(element.id)?.classList.add("scam-indicator-red");
      } else {
        setHintFeedbackMessage("This element appears legitimate.");
        setHintFeedbackType("success");
        document.getElementById(element.id)?.classList.add("scam-indicator-green");
      }
  
      setShowHintFeedback(true);
      setTimeout(() => {
        setShowHintFeedback(false);
      }, 3000);
    }
  };
  
  
  const fetchEmailData = async (index) => {
    setLoading(true);
    setError(null);
    // Reset verdict and explanations state for new question
    setVerdictSubmitted(false);
    setExplanationsComplete(false);
    
    try {
      const response = await fetch("http://172.31.35.32:5050/fetch_email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_path: filePath,
          number: index,
          time_elapsed: timer,
          hints_used: hintsUsed,  // Pass the hints used to the backend
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if this is a session closure response
      if (data.response_type === "session_closure") {
        console.log("we are inside session closure");
        setSessionClosureData(data);  // Set session closure data
      } else {
        // Otherwise, handle regular email data
        console.log("printing current email data", data);
        setEmailData(data);
        
        // Set total questions if it's available in the response
        if (data.total_questions) {
          setTotalQuestions(data.total_questions);
        }
      }
    } catch (err) {
      console.error("Error fetching email data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the file initially to get total number of questions
  useEffect(() => {
    if (filePath) {
      const fetchFileMetadata = async () => {
        try {
          const response = await fetch("http://172.31.35.32:5010/file_metadata", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file_path: filePath,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.total_emails) {
            setTotalQuestions(data.total_emails);
          }
        } catch (err) {
          console.error("Error fetching file metadata:", err);
        }
      };
      
      fetchFileMetadata();
    }
  }, [filePath]);

  // Effect for checking verdict state from VerdictButtons
  useEffect(() => {
    const checkVerdictState = () => {
      if (window.verdictState) {
        setVerdictSubmitted(window.verdictState.verdictSubmitted);
      }
    };

    // Check initially and set up interval to check periodically
    checkVerdictState();
    const interval = setInterval(checkVerdictState, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Only fetch email data after hint modal is closed
    if (filePath && !showHintModal) {
      fetchEmailData(emailIndex);
    } else if (!filePath) {
      setError("File path not provided.");
      setLoading(false);
    }
    
    // Only start the timer after hint modal is closed
    let interval;
    if (!showHintModal) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filePath, emailIndex, showHintModal]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const handleNext = () => setEmailIndex((prev) => prev + 1);
  
  // Handle explanations complete callback
  const handleExplanationsComplete = () => {
    setExplanationsComplete(true);
    if (window.verdictState && window.verdictState.handleExplanationsComplete) {
      window.verdictState.handleExplanationsComplete();
    }
  };
  
  // Only add the beforeunload event listener if the session is NOT complete
  useEffect(() => {
    // Only set up the beforeunload event if we're still in an active session
    if (!sessionClosureData) {
      const handleBeforeUnload = (e) => {
        // This will trigger the browser's native "Are you sure you want to leave?" dialog
        e.preventDefault();
        e.returnValue = "Changes you made may not be saved. Are you sure you want to leave?";
        return e.returnValue;
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [sessionClosureData]); 
  
  // Set the root background color once when component mounts
  useEffect(() => {
    document.body.style.backgroundColor = "#121212";
    return () => {
      // Reset when component unmounts
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (hintsUsed >= maxHints) {
      // Remove all scam indicator colors
      document.querySelectorAll(".scam-indicator-red, .scam-indicator-green").forEach((el) => {
        el.classList.remove("scam-indicator-red", "scam-indicator-green");
      });
    }
  }, [hintsUsed]);
  
  
  if (sessionClosureData) {
    return (
      <SessionPerformance
        compliment={sessionClosureData.compliment}
        bonus_xps={sessionClosureData.bonus_xps}
        raw_score={sessionClosureData.raw_score}
        accuracy={sessionClosureData.accuracy}
        time_compliment={sessionClosureData.time_compliment}
        hint_penalty={hintsUsed * 5}  // Pass hint penalty information
      />
    );
  }
  
  if (loading && !showHintModal) {
    return (
      <div className="scamSpotter" style={{ backgroundColor: "#121212" }}>
        <h6 className="scamSpotterMode">📆 Daily Practice</h6>
        <h1 className="py-1">Loading...</h1>
        <h6>Current Timer: {formatTime(timer)}</h6>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="scamSpotter" style={{ backgroundColor: "#121212" }}>
        <h6 className="scamSpotterMode">📆 Daily Practice</h6>
        <h1 className="py-1">Error Loading Content</h1>
        <p>Error: {error}</p>
        <h6>Current Timer: {formatTime(timer)}</h6>
      </div>
    );
  }
  
  if (!emailData && !showHintModal) {
    return (
      <div className="scamSpotter" style={{ backgroundColor: "#121212" }}>
        <h6 className="scamSpotterMode">📆 Daily Practice</h6>
        <h1 className="py-1">No Email Data Available</h1>
        <h6>Current Timer: {formatTime(timer)}</h6>
      </div>
    );
  }
  
  return (
    <div className="scamSpotter" style={{ backgroundColor: "#121212", minHeight: "100vh" }}>
      {/* Show hint modal without additional wrapper */}
        {showHintModal && (
        <HintInformationModal 
          show={showHintModal} 
          onClose={() => setShowHintModal(false)} 
        />
      )}

        {/* Toast for hint limit reached */}
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1050
      }}
    >
      <Toast 
        show={showLimitToast} 
        onClose={() => setShowLimitToast(false)}
        delay={3000}
        autohide
        bg="warning"
        style={{
          border: "1px solid #ffcc00",
          boxShadow: "0 0 10px rgba(255, 204, 0, 0.5)",
          backgroundColor: "rgba(33, 15, 61, 0.9)",
        }}
      >
        <Toast.Header style={{ backgroundColor: "rgba(33, 15, 61, 0.9)", color: "#fff" }}>
          <strong className="me-auto">
            <i className="fa fa-exclamation-triangle me-2"></i>
            Hint Limit Reached
          </strong>
        </Toast.Header>
        <Toast.Body style={{ color: "#fff" }}>
          No more hints available!
        </Toast.Body>
      </Toast>
    </div>


      
      {/* Only show the content if hint modal is closed or if we have email data */}
      {(!showHintModal && emailData) && (
        <>
          <h6 className="scamSpotterMode">📆 Daily Practice</h6>
          <h1 className="py-1">Spot The Scam!</h1>
          <span>Examine the email and assess whether it is fraudulent or legitimate.</span>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="question-counter">
              Question {emailIndex + 1} of {totalQuestions || "?"}
            </div>
            <div className="cyber-timer">
              Time: <span className="timer-value">{formatTime(timer)}</span>
            </div>
          </div>
          <Container fluid className="my-3">
            <Row className="justify-content-center" style={{ minHeight: "600px" }}>
              {/* Left Column - Auth Data and Persona */}
              <Col xs={3} className="d-flex flex-column">
                <div className="mb-4">
                  <EmailAuthData mode={mode} metadata={emailData.email_auth} />
                </div>
                <div>
                  <Persona personaDetails={emailData.persona_details} />
                </div>
              </Col>
      
              {/* Middle Column - Email Content */}
              <Col xs={6}>
                <EmailTemplate
                  emailHeader={emailData.email_header}
                  emailContent={emailData.email_content}
                  logoSrc={emailData.logo_src}
                  footer={emailData.footer}
                  scamIndicators={emailData.scam_indicators}
                  checkIndicators={emailData.check_indicators}
                  mode={mode}
                  explanations={emailData.explanations}
                  verdictSubmitted={verdictSubmitted}
                  onExplanationsComplete={handleExplanationsComplete}
                  onElementClick={handleElementClick}
                  disableHintSelection={hintsUsed >= maxHints}  // Pass the new flag here
                />
              </Col>
      
              {/* Right Column - Mode Toggle and Verdict */}
              <Col xs={3} className="d-flex flex-column align-items-center text-center">
                <div className="mb-4">
                  <div className="d-flex flex-column align-items-center">
                    <Toggle setMode={handleModeChange} mode={mode} />
                    
                    {/* Hint Counter Badge - Now always visible regardless of mode */}
                    <Badge 
                      className="mt-2" 
                      style={{ 
                        backgroundColor: "rgba(33, 15, 61, 0.8)",
                        color: hintsUsed >= maxHints ? "#ff3e3e" : "#00fff7",
                        border: `1px solid ${hintsUsed >= maxHints ? "#ff3e3e" : "#00fff7"}`,
                        boxShadow: `0 0 8px ${hintsUsed >= maxHints ? "rgba(255, 62, 62, 0.4)" : "rgba(0, 255, 247, 0.4)"}`,
                        padding: "0.4rem 0.8rem",
                      }}
                    >
                      {hintsUsed >= maxHints ? 
                        "No hints remaining" : 
                        `Hints: ${hintsUsed}/${maxHints} (−${hintsUsed * 5} XP)`
                      }
                    </Badge>
                  </div>
                </div>
                <div>
                  <VerdictButtons 
                    filePath={filePath} 
                    emailIndex={emailIndex} 
                    onNext={handleNext}
                    hintsUsed={hintsUsed}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </>
      )}
      
      {/* Hint Feedback Toast */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1050
        }}
      >
        <Toast 
          show={showHintFeedback} 
          onClose={() => setShowHintFeedback(false)}
          delay={3000}
          autohide
          bg={hintFeedbackType === "danger" ? "danger" : "success"}
          style={{
            border: hintFeedbackType === "danger" ? 
              "1px solid #ff3e3e" : 
              "1px solid #00fff7",
            boxShadow: hintFeedbackType === "danger" ? 
              "0 0 10px rgba(255, 62, 62, 0.5)" : 
              "0 0 10px rgba(0, 255, 247, 0.5)",
            backgroundColor: "rgba(33, 15, 61, 0.9)",
          }}
        >
          <Toast.Header style={{ backgroundColor: "rgba(33, 15, 61, 0.9)", color: "#fff" }}>
            <strong className="me-auto">
              <i className={`fa fa-${hintFeedbackType === "danger" ? "exclamation-triangle" : "check-circle"} me-2`}></i>
              Hint Feedback
            </strong>
          </Toast.Header>
          <Toast.Body style={{ color: "#fff" }}>
            {hintFeedbackMessage}
          </Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default SSPractice;