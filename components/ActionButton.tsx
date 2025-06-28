import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  disabled = false, 
  children, 
  className = '' 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-8 py-4 text-lg text-slate-700 font-light tracking-wider
      bg-slate-200/50 hover:bg-slate-300/60
      disabled:bg-slate-100/50 disabled:text-slate-400 disabled:cursor-not-allowed
      rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/50
      transition-all duration-300 ease-in-out
      ${className}
    `}
  >
    {children}
  </button>
);

export default ActionButton;