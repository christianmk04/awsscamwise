import { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import "../../styles/ScamSpotter.css";

const EmailTemplate = ({
  emailHeader,
  emailContent,
  logoSrc,
  footer,
  scamIndicators,
  checkIndicators,
  mode,
  explanations,
  verdictSubmitted,
  onExplanationsComplete,
  onElementClick, // This prop will be used to notify parent component about clicks
  disableHintSelection
}) => {
  const [showMetaData, setShowMetaData] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [hoveredLink, setHoveredLink] = useState("");
  
  // For positioned tooltips
  const [showLearningTooltip, setShowLearningTooltip] = useState(false);
  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  // Refs for components to position tooltips near
  const emailHeaderRef = useRef(null);
  const emailAuthRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);
  const bodyRef = useRef(null);
  const emailContainerRef = useRef(null);

  // Map component names to their refs
  const componentRefs = {
    "email_header": emailHeaderRef,
    "email_auth": emailHeaderRef, // Will position near header since auth data is in another component
    "links": linksRef,
    "overall": bodyRef,
    "logo": logoRef,
    "body": bodyRef,
    "footer": null, // Will be positioned dynamically
    "greeting": null, // Will be positioned dynamically
    "signature": null, // Will be positioned dynamically
    "closing": null // Will be positioned dynamically
  };

  // Watch for verdict submission to show learning tooltips
  useEffect(() => {
    if (verdictSubmitted && explanations && explanations.length > 0) {
      setShowLearningTooltip(true);
      positionTooltipForCurrentExplanation();
    }
  }, [verdictSubmitted, explanations]);

  // Position tooltip near the relevant component
  const positionTooltipForCurrentExplanation = () => {
    if (!explanations || explanations.length === 0) return;
    
    const currentExplanation = explanations[currentExplanationIndex];
    const componentName = currentExplanation?.component;
    
    if (!componentName) return;
    
    // Get the ref for this component
    const ref = componentRefs[componentName];
    const container = emailContainerRef.current;
    
    if (ref && ref.current && container) {
      // Get positions relative to container
      const containerRect = container.getBoundingClientRect();
      const elementRect = ref.current.getBoundingClientRect();
      
      // Calculate position (show to the right of the element)
      setTooltipPosition({
        top: elementRect.top - containerRect.top + 10,
        left: elementRect.right - containerRect.left + 10,
      });
    } else {
      // Default positioning if ref not available
      // Position in the center-right of the email container
      if (container) {
        const containerRect = container.getBoundingClientRect();
        setTooltipPosition({
          top: containerRect.height / 3,
          left: containerRect.width / 2,
        });
      }
    }
  };
  const handleSelect = (elementId) => {
    if (mode === "select") {
      // Do nothing if hints are exhausted
      if (disableHintSelection) {
        return;
      }
      
      // Prevent multiple clicks on the same element
      if (selectedElements.some((el) => el.id === elementId)) {
        return;
      }

      // Notify parent component about the click event
      const isScam = scamIndicators && scamIndicators.includes(elementId);
      if (onElementClick) {
        onElementClick({ id: elementId, is_malicious: isScam });
      }
      
      // Add the element to the selectedElements array (irreversible)
      setSelectedElements((prev) => [
        ...prev,
        { id: elementId, className: isScam ? "scam-indicator" : "safe-indicator" }
      ]);
    }
  };
  

  // Close feedback modal
  const handleCloseModal = () => setShowModal(false);

  // Handle next button in learning tooltip
  const handleNextExplanation = () => {
    if (currentExplanationIndex < explanations.length - 1) {
      setCurrentExplanationIndex(prevIndex => prevIndex + 1);
      // Set timeout to allow state update before positioning
      setTimeout(() => {
        positionTooltipForCurrentExplanation();
      }, 50);
    } else {
      setShowLearningTooltip(false);
      setCurrentExplanationIndex(0);
      // Notify parent that explanations are complete
      if (onExplanationsComplete) {
        onExplanationsComplete();
      }
    }
  };

  // Toggle metadata (disabled in select mode)
  const handleToggleMetaData = (event) => {
    if (mode === "select") {
      event.preventDefault();
    } else {
      setShowMetaData(!showMetaData);
    }
  };

  // Provide defaults if emailContent arrays are missing
  const links = emailContent?.links || [];
  const paragraphs = emailContent?.paragraphs || [];

  // Get current explanation
  const getCurrentExplanation = () => {
    if (!explanations || explanations.length === 0) return null;
    return explanations[currentExplanationIndex];
  };

  // Format title for learning tooltip
  const getExplanationTitle = (explanation) => {
    if (!explanation) return "Learning Point";
    
    const componentTitles = {
      "email_header": "Email Header Issues",
      "email_auth": "Authentication Problems",
      "links": "Suspicious Links",
      "overall": "Overall Assessment"
    };
    
    return componentTitles[explanation.component] || "Learning Point";
  };

  return (
    <div className="email-container" ref={emailContainerRef}>
      <div className="email-box">
        <table border="0" cellPadding="0" cellSpacing="0" width="100%">
          <tbody>
            {/* Email Subject Section */}
            <tr>
              <td
                className={`email-subject ${selectedElements.find((el) => el.id === emailHeader.id)?.className || ""}`}
                onClick={() => handleSelect(emailHeader.id)}
                ref={emailHeaderRef}
              >
                Subject: {emailHeader.subject}
                <span
                  onClick={handleToggleMetaData}
                  className={`metadata-toggle ${showMetaData ? "rotated" : ""}`}
                >
                  ▼
                </span>
              </td>
            </tr>

            {/* Email Metadata */}
            {showMetaData && (
              <tr>
                <td className="email-metadata">
                  <div><strong>From:</strong> {emailHeader["from"]}</div>
                  <div><strong>To:</strong> {emailHeader["to"]}</div>
                  <div><strong>Date:</strong> {emailHeader["date"]}</div>
                  <div><strong>Mailed-By:</strong> {emailHeader["mailed-by"]}</div>
                  <div><strong>Reply-To:</strong> {emailHeader["reply-to"]}</div>
                  <div><strong>Signed-By:</strong> {emailHeader["signed-by"]}</div>
                  <div><strong>Security:</strong> {emailHeader["security"]}</div>
                </td>
              </tr>
            )}

            {/* Logo */}
            <tr>
              <td
                className={`email-logo ${selectedElements.find((el) => el.id === "logo")?.className || ""}`}
                onClick={() => handleSelect("logo")}
                align="center"
                style={{ padding: "20px" }}
                ref={logoRef}
              >
                <img src={logoSrc} alt="Company Logo" className="w-100" />
              </td>
            </tr>

            {/* Email Body */}
            <tr>
              <td className="email-content" ref={bodyRef}>
                {/* Greeting */}
                <div
                  className={`email-greeting ${selectedElements.find((el) => el.id === "greeting")?.className || ""}`}
                  onClick={() => handleSelect("greeting")}
                >
                  {emailContent?.greeting}
                </div>

                {/* Email Body Text */}
                <div
                  className={`email-body ${selectedElements.find((el) => el.id === "body")?.className || ""}`}
                  onClick={() => handleSelect("body")}
                >
                  {emailContent?.body}
                </div>

                {/* Paragraphs */}
                {paragraphs.map((paragraph, index) => (
                  <div
                    key={index}
                    className={`email-paragraph ${selectedElements.find((el) => el.id === `paragraph-${index}`)?.className || ""}`}
                    onClick={() => handleSelect(`paragraph-${index}`)}
                  >
                    {paragraph}
                  </div>
                ))}

                {/* Call-to-Action Buttons */}
                {links.length > 0 && (
                  <div className="cta-buttons" ref={linksRef}>
                    {links.map((action, index) => (
                      <a
                        key={action.id || index}
                        className={`cta-button ${selectedElements.find((el) => el.id === action.id)?.className || ""}`}
                        href={action.url}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(action.id);
                        }}
                        onMouseEnter={() => setHoveredLink(action.url)}
                        onMouseLeave={() => setHoveredLink("")}
                      >
                        {action?.text || "No text"}
                      </a>
                    ))}
                  </div>
                )}

                {/* Closing & Signature */}
                <div
                  className={`email-closing ${selectedElements.find((el) => el.id === "closing")?.className || ""}`}
                  onClick={() => handleSelect("closing")}
                >
                  {emailContent?.closing}
                </div>
                <div
                  className={`email-signature ${selectedElements.find((el) => el.id === "signature")?.className || ""}`}
                  onClick={() => handleSelect("signature")}
                >
                  {emailContent?.signature}
                </div>
              </td>
            </tr>

            {/* Footer */}
            <tr>
              <td
                className={`email-footer ${selectedElements.find((el) => el.id === "footer")?.className || ""}`}
                onClick={() => handleSelect("footer")}
              >
                <p>{footer?.text || ""}</p>
                {footer?.unsubscribe && (
                  <p>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      Unsubscribe
                    </a>
                  </p>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

     {/* Feedback Modal */}
     {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Feedback</h5>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {modalMessage}
            </div>
            <div className="modal-footer">
              <Button variant="primary" onClick={handleCloseModal}>OK</Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Learning Tooltip */}
      {showLearningTooltip && getCurrentExplanation() && (
        <div className="learning-tooltip" style={{ top: tooltipPosition.top, left: tooltipPosition.left }}>
          <h5>{getExplanationTitle(getCurrentExplanation())}</h5>
          <p>{getCurrentExplanation()?.explanation || "No explanation provided."}</p>
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <Button variant="primary" size="sm" onClick={handleNextExplanation}>
              {currentExplanationIndex < explanations.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplate;