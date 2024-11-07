import React from "react";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-[#282828]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default LoadingSpinner;
