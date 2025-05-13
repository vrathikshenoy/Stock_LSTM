import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading prediction data...</p>
    </div>
  );
};

export default LoadingSpinner;
