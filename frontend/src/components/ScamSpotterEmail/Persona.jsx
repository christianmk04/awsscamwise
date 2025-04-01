import { useState } from "react";
import "../../styles/ScamSpotter.css";
import PropTypes from "prop-types";

const Persona = ({ personaDetails }) => {
  const [showTable, setShowTable] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);

  const handleSelect = (event, elementId) => {
    // Prevent selecting the toggle button itself
    if (event.target.closest(".personaHeader")) return;

    setSelectedElements((prev) =>
      prev.includes(elementId)
        ? prev.filter((id) => id !== elementId)
        : [...prev, elementId]
    );
  };

  return (
    <div className="emailPersona mt-3 pt-3">
      {/* Single container for button and text with grid layout */}
      <div className="personaHeader">
        <button
          className={`detailBtn ${showTable ? "clicked" : ""}`}
          onClick={() => setShowTable(!showTable)}
        >
          <img
            src="../../public/persona.png"
            alt="Persona-Info"
            className="personaIcon"
          />
        </button>
        <span className={`personaDetail ${showTable ? "bold" : ""}`}>
          Persona <br /> Information
        </span>
      </div>

      {/* Wrapper for stable layout, set min-height for consistent spacing */}
      <div className="table-container-wrapper">
        {/* Conditionally render the table */}
        {showTable && (
          <div className="table-container">
            <table className="emailData">
              <tbody>
                <tr
                  className={selectedElements.includes("persona_email") ? "selected" : ""}
                  onClick={(e) => handleSelect(e, "persona_email")}
                >
                  <th>Email:</th>
                  <td>{personaDetails["persona_email"]}</td>
                </tr>
                {/* Add more rows here as necessary */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Props Validation
Persona.propTypes = {
  personaDetails: PropTypes.object.isRequired,
};

export default Persona;
