/**
 * Utility to generate a downloadable postcard image from the enigmatic vision
 */

/**
 * Creates a postcard image with the vision, phrase, and explanation
 * @param imageUrl URL of the image to include
 * @param phrase The mystical phrase to display
 * @param explanation The explanation of the phrase (optional)
 * @param fileName Name for the downloaded file
 * @param forceSquareImage Whether to force the image to be square (1:1 aspect ratio)
 */
export const generatePostcard = async (
  imageUrl: string,
  phrase: string,
  explanation: string | null,
  fileName: string = 'enigmatic-postcard',
  forceSquareImage: boolean = true
): Promise<void> => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Set canvas dimensions for a nice postcard (3:2 ratio)
  canvas.width = 1200;
  canvas.height = 800;
  
  // Load the image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  return new Promise((resolve) => {
    img.onload = () => {
      // Fill background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 10;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      // Calculate image dimensions
      let imageWidth, imageHeight, imageX, imageY;
      
      if (forceSquareImage) {
        // Square image (1:1 aspect ratio)
        const imageSize = Math.min(canvas.height - 80, canvas.width * 0.45);
        imageWidth = imageSize;
        imageHeight = imageSize;
        imageX = 40;
        imageY = (canvas.height - imageSize) / 2;
        
        // Draw image with 1:1 aspect ratio
        ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);
      } else {
        // Maintain original aspect ratio
        const maxWidth = canvas.width * 0.45;
        const maxHeight = canvas.height - 80;
        
        let ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        imageWidth = img.width * ratio;
        imageHeight = img.height * ratio;
        
        imageX = 40;
        imageY = (canvas.height - imageHeight) / 2;
        
        // Draw image with original aspect ratio
        ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
      }
      
      // Draw divider
      ctx.beginPath();
      ctx.moveTo(imageX + imageWidth + 20, 40);
      ctx.lineTo(imageX + imageWidth + 20, canvas.height - 40);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Set up text area
      const textX = imageX + imageWidth + 40;
      const textWidth = canvas.width - textX - 40;
      let textY = 80;
      
      // Draw title
      ctx.font = 'bold 28px serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('ENIGMATIC VISION', textX, textY);
      textY += 50;
      
      // Draw phrase
      ctx.font = 'italic 22px serif';
      ctx.fillStyle = '#475569';
      
      // Word wrap the phrase
      const wrappedPhrase = wrapText(ctx, `"${phrase}"`, textWidth);
      wrappedPhrase.forEach(line => {
        ctx.fillText(line, textX, textY);
        textY += 30;
      });
      
      textY += 30;
      
      // Draw explanation if available
      if (explanation) {
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#64748b';
        
        // Word wrap the explanation
        const wrappedExplanation = wrapText(ctx, explanation, textWidth);
        wrappedExplanation.forEach(line => {
          ctx.fillText(line, textX, textY);
          textY += 25;
        });
      }
      
      // Add a small signature at the bottom
      ctx.font = '16px serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Enigmatic Visions', textX, canvas.height - 60);
      
      // Convert to image and trigger download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      resolve();
    };
    
    img.src = imageUrl;
  });
};

/**
 * Helper function to wrap text within a given width
 */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  lines.push(currentLine);
  return lines;
};
