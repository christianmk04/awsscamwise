import React, {useState} from "react"
import "../../styles/ScamSpotter.css"

const ModeInstruction =( {mode }) =>{
    let instructionText;

    if (mode==="easy1"){
        instructionText = "Examine the email and select all relevant areas that you reviewed for potential scam indicators."
    }
    else if (mode === "easy2"){
        instructionText = "Indicate whether the email is fraudulent or legitimate.";
    }   
    else if(mode==="hard1"){
        instructionText = "Examine the email and assess whether it is fraudulent or legitimate.";
    }
    else if(mode==="hard2"){
        instructionText="Select all scam indicators."
    }

    return(
        <span className="scamSpotterInstruction">{instructionText}</span>
    )
    

}

export default ModeInstruction;