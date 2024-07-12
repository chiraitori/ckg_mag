// src/components/Loader.tsx
import React from 'react';

const Loader = () => {
  return (
    <div className="relative w-4 h-4 rounded-full bg-red-600">
      <div className="absolute inset-0 rounded-full bg-white animate-rotate"></div>
      <div className="absolute inset-0 rounded-full bg-white animate-rotate delay-500"></div>
    </div>
  );
};

export default Loader;
