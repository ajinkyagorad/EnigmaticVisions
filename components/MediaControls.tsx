import React, { useState } from 'react';

interface MediaControlsProps {
  imageUrl?: string;
  text?: string;
  fileName?: string;
}

const MediaControls: React.FC<MediaControlsProps> = ({ imageUrl, text, fileName = 'enigmatic-vision' }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const handleDownloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${fileName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
    } catch (err) {
      console.error('Failed to copy image: ', err);
    }
  };
  
  const handleCopyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };
  
  const handleDownloadText = () => {
    if (!text) return;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  if (!imageUrl && !text) return null;
  
  return (
    <div 
      className="absolute top-2 right-2 flex gap-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {imageUrl && (
        <>
          <button 
            onClick={handleDownloadImage}
            className={`p-2 rounded-full bg-black/30 backdrop-blur-sm text-white transition-opacity ${isHovering ? 'opacity-80' : 'opacity-0'} hover:opacity-100`}
            title="Download image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <button 
            onClick={handleCopyImage}
            className={`p-2 rounded-full bg-black/30 backdrop-blur-sm text-white transition-opacity ${isHovering ? 'opacity-80' : 'opacity-0'} hover:opacity-100`}
            title="Copy image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </>
      )}
      
      {text && (
        <>
          <button 
            onClick={handleCopyText}
            className={`p-2 rounded-full bg-black/30 backdrop-blur-sm text-white transition-opacity ${isHovering ? 'opacity-80' : 'opacity-0'} hover:opacity-100`}
            title="Copy text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          
          <button 
            onClick={handleDownloadText}
            className={`p-2 rounded-full bg-black/30 backdrop-blur-sm text-white transition-opacity ${isHovering ? 'opacity-80' : 'opacity-0'} hover:opacity-100`}
            title="Download text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default MediaControls;
