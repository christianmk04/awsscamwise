import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaSkull } from "react-icons/fa";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import { MdNavigateNext } from "react-icons/md";

const VerdictButtons = ({ filePath, emailIndex, onNext }) => {
  const [modalShow, setModalShow] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  // New state to track if verdict is submitted (for learning modals)
  const [verdictSubmitted, setVerdictSubmitted] = useState(false);
  // New state to track if explanations are complete
  const [explanationsComplete, setExplanationsComplete] = useState(false);

  // Use useEffect to set window.verdictState instead of rendering it
  useEffect(() => {
    window.verdictState = {
      verdictSubmitted,
      handleExplanationsComplete
    };
    // Clean up the global variable when component unmounts
    return () => {
      window.verdictState = undefined;
    };
  }, [verdictSubmitted]);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "#1E1E2F",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "2px solid #8E44AD",
    width: "250px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  };

  const labelStyle = {
    fontSize: "1.2rem",
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  };

  const buttonStyle = (bgColor, borderColor) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    border: `2px solid ${borderColor}`,
    borderRadius: "30px",
    padding: "0.7rem 1.2rem",
    backgroundColor: bgColor,
    color: "#fff",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    justifyContent: "center",
    width: "180px",
    fontSize: "1rem",
    fontWeight: "bold",
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
  });

  const nextButtonStyle = {
    borderRadius: "30px",
    width: "180px",
    marginTop: "1rem",
  };

  const handleClick = (userAnswer) => {
    if (isDisabled) return;

    setIsDisabled(true);
    const answer = userAnswer === "malicious";

    console.log("Calling check_answer endpoint with:", filePath, emailIndex, answer);
    fetch("http://172.31.35.32:5050/check_answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_path: filePath, number: emailIndex, answer: answer }),
    })
      .then((response) => response.json())
      .then((data) => {
        // If the filepath has \ change it to / for windows
        let formattedFilePath = filePath;
        if (formattedFilePath.includes("\\")) {
          formattedFilePath = formattedFilePath.replace(/\\/g, "/");
        }

        let session_number = formattedFilePath.split("temp_ss_session/session_")[1].slice(0, -5);
        console.log("printing session number", session_number)
        let score = data.type === "correct" ? 10 : 0;
        console.log("printing score", score)
    
        // Instantly update the UI
        setModalMessage(data.type === "correct" ? "That's right! You're killing it! 🥳" : "Oops, try harder next time? 💪🏻");
        setIsCorrect(data.type === "correct");
        setModalShow(true);
        
        // Set verdict submitted to trigger learning modals
        setVerdictSubmitted(true);
    
        // Update score in the background (does not block UI)
        fetch(`http://172.31.35.32:5020/session/update_score/${session_number}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: score }),
        }).catch((error) => console.error("Error updating session score:", error));
      })
      .catch((error) => {
        console.error("Error calling check_answer endpoint:", error);
        setModalMessage("Error calling check_answer endpoint.");
        setIsCorrect(false);
        setModalShow(true);
      });    
  };

  // Handle when explanations are complete
  const handleExplanationsComplete = () => {
    setExplanationsComplete(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={containerStyle}>
        <span style={labelStyle}>Your Verdict</span>

        <button
          style={buttonStyle("#2ECC71", "#27AE60")}
          onClick={() => handleClick("legitimate")}
          disabled={isDisabled}
        >
          <FaShieldAlt /> Legitimate
        </button>

        <button
          style={buttonStyle("#E74C3C", "#C0392B")}
          onClick={() => handleClick("malicious")}
          disabled={isDisabled}
        >
          <FaSkull /> Malicious
        </button>
      </div>

      {/* Only show Next button after explanations are complete or if no explanations */}
      {isDisabled && explanationsComplete && (
        <Button 
          variant="primary" 
          onClick={onNext} 
          style={nextButtonStyle}
        >
          Next <MdNavigateNext />
        </Button>
      )}

      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Your Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

VerdictButtons.propTypes = {
  filePath: PropTypes.string.isRequired,
  emailIndex: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default VerdictButtons;