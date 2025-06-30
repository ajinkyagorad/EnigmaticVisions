import React from 'react';

interface AutoPlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const AutoPlayButton: React.FC<AutoPlayButtonProps> = ({ 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group
        w-14 h-14 rounded-full
        focus:outline-none focus:ring-2 focus:ring-slate-400/50
        transition-all duration-300 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label="Auto play"
    >
      {/* Outer circle */}
      <div className="absolute inset-0 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-all"></div>
      
      {/* Play icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6 text-slate-600 group-hover:text-slate-800 transition-colors"
        >
          <path 
            fillRule="evenodd" 
            d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
    </button>
  );
};

export default AutoPlayButton;
