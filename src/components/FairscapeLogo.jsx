import React from "react";

const FairscapeLogo = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left curly brace */}
    <path
      d="M20 10 Q10 25 20 40 L20 45 Q10 50 20 55 L20 60 Q10 75 20 90"
      fill="none"
      stroke="white"
      strokeWidth="4"
    />

    {/* Right curly brace */}
    <path
      d="M80 10 Q90 25 80 40 L80 45 Q90 50 80 55 L80 60 Q90 75 80 90"
      fill="none"
      stroke="white"
      strokeWidth="4"
    />

    {/* Horizontal lines representing tabular data */}
    <path d="M30 30 H70 M30 50 H70 M30 70 H70" stroke="white" strokeWidth="4" />

    {/* Vertical lines representing tabular data */}
    <path d="M40 20 V80 M60 20 V80" stroke="white" strokeWidth="4" />

    {/* Connecting dots representing data points */}
    <circle cx="40" cy="30" r="3" fill="white" />
    <circle cx="60" cy="50" r="3" fill="white" />
    <circle cx="40" cy="70" r="3" fill="white" />
  </svg>
);

export default FairscapeLogo;
