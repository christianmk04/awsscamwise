import { useState } from "react";
import "../../styles/ScamSpotter.css";
import PropTypes from "prop-types";

const EmailAuth = ({ mode, metadata }) => {
  const [showTable, setShowTable] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);

  const handleSelect = (event, elementId) => {
    // Prevent selecting the toggle button itself
    if (event.target.closest(".authHeader")) return;

    if (mode === "select") {
      setSelectedElements((prev) =>
        prev.includes(elementId)
          ? prev.filter((id) => id !== elementId)
          : [...prev, elementId]
      );
    }
  };


  return (
    <div className="emailAuth mt-3 pt-3">
      {/* Single container for button and text with grid layout */}
      <div className="authHeader">
        <button
          className={`detailBtn ${showTable ? "clicked" : ""}`}
          onClick={() => setShowTable(!showTable)}
        >
          <img
            src="../../public/padlock.png"
            alt="Auth-Status"
            className="authIcon"
          />
        </button>
        <span className={`authStatus ${showTable ? "bold" : ""}`}>
          Authentication <br /> Status
        </span>
      </div>

      {/* Conditionally render the table */}
      {showTable && (
        <div className="table-container">
          <table className="emailData">
            <tbody>
              <tr
                className={selectedElements.includes("SPF") ? "selected" : ""}
                onClick={(e) => handleSelect(e, "SPF")}
              >
                <th>SPF:</th>
                <td>{metadata["SPF"]}</td>
              </tr>
              <tr
                className={selectedElements.includes("DKIM") ? "selected" : ""}
                onClick={(e) => handleSelect(e, "DKIM")}
              >
                <th>DKIM:</th>
                <td>{metadata["DKIM"]}</td>
              </tr>
              <tr
                className={selectedElements.includes("DMARC") ? "selected" : ""}
                onClick={(e) => handleSelect(e, "DMARC")}
              >
                <th>DMARC:</th>
                <td>{metadata["DMARC"]}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Props Validation
EmailAuth.propTypes = {
  mode: PropTypes.string,
  metadata: PropTypes.object,
};

export default EmailAuth;
