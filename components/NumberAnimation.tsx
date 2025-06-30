import React, { useState, useEffect, useRef } from 'react';

interface NumberAnimationProps {
  targetNumber: number;
  onComplete?: () => void;
  duration?: number;
}

const NumberAnimation: React.FC<NumberAnimationProps> = ({ 
  targetNumber, 
  onComplete,
  duration = 2000 
}) => {
  const [displayedNumber, setDisplayedNumber] = useState<string>('0000');
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Format the number with leading zeros
  const formatNumber = (num: number): string => {
    return num.toString().padStart(4, '0');
  };
  
  // Generate a random number for animation
  const generateRandomNumber = (): string => {
    return formatNumber(Math.floor(Math.random() * 10000));
  };
  
  useEffect(() => {
    if (!isAnimating) return;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      
      // Calculate progress (0 to 1)
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out function for smooth acceleration and deceleration
      const easeInOut = (t: number): number => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };
      
      const easedProgress = easeInOut(progress);
      
      // Determine if we should show the final number
      if (progress >= 1) {
        setDisplayedNumber(formatNumber(targetNumber));
        setIsAnimating(false);
        if (onComplete) onComplete();
        return;
      }
      
      // Generate random numbers with increasing probability of showing correct digits
      const targetStr = formatNumber(targetNumber);
      let result = '';
      
      for (let i = 0; i < 4; i++) {
        // As progress increases, increase chance of showing correct digit
        if (Math.random() < easedProgress * 2) {
          result += targetStr[i];
        } else {
          result += Math.floor(Math.random() * 10).toString();
        }
      }
      
      setDisplayedNumber(result);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, targetNumber, duration, onComplete]);
  
  return (
    <div className="number-animation">
      <div className="text-7xl font-thin text-slate-800 tracking-wider font-mono relative overflow-hidden">
        {displayedNumber.split('').map((digit, index) => (
          <span 
            key={index} 
            className={`inline-block w-[1ch] ${isAnimating ? 'animate-pulse' : ''}`}
            style={{ 
              opacity: isAnimating ? 0.9 : 1,
              textShadow: isAnimating ? '0 0 8px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NumberAnimation;
