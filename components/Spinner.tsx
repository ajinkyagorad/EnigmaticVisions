import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse"></div>
  </div>
);

export default Spinner;