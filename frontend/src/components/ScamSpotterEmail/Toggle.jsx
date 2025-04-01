import React, { useState } from "react";
import "../../styles/ScamSpotter.css";

const Toggle = ({ mode, setMode }) => { // Accept mode and setMode as props
  return (
    <div className="toggleContainer">
      <h5 className="text-center text-underline">Mode</h5>
      <div className="toggle">
        <h6 className={`buttonLabel ${mode === "inspect" ? "activeLabel" : ""}`}>
          Inspect
        </h6>
        <button
          className={`toggleBtn ${mode === "inspect" ? "active" : ""}`}
          onClick={() => setMode("inspect")} // Update mode
        >
          <img src="../../public/magnifying_glass.png" alt="Inspect" />
        </button>
      </div>

      <div className="toggle">
        <h6 className={`buttonLabel ${mode === "select" ? "activeLabel" : ""}`}>
          Select
        </h6>
        <button
          className={`toggleBtn ${mode === "select" ? "active" : ""}`}
          onClick={() => setMode("select")} // Update mode
        >
          <img src="../../public/select.png" alt="Select" />
        </button>
      </div>
    </div>
  );
};


export default Toggle;



