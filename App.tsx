import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateMysticPhrase, generateEnigmaticImage, generatePhraseExplanation, ImageStyle } from './services/geminiService';
import ActionButton from './components/ActionButton';
import Spinner from './components/Spinner';
import MediaControls from './components/MediaControls';
import NumberAnimation from './components/NumberAnimation';
import AutoPlayButton from './components/AutoPlayButton';
import { generatePostcard } from './utils/postcardGenerator';

export enum AppStep {
  Initial = 0,
  NumberGenerated = 1,
  PhraseGenerated = 2,
  ImageGenerated = 3,
  Error = 4,
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Initial);
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [mysticPhrase, setMysticPhrase] = useState<string>('');
  const [phraseExplanation, setPhraseExplanation] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hostname, setHostname] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.HUMAN_FORM);
  // We keep the state for compatibility with existing code but primarily use the ref for current value
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [showNumberAnimation, setShowNumberAnimation] = useState<boolean>(false);
  const [isGeneratingPostcard, setIsGeneratingPostcard] = useState<boolean>(false);
  const phraseRef = useRef<HTMLDivElement>(null);
  const numberAnimationTimeoutRef = useRef<number | null>(null);
  const autoPlayTimeoutRef = useRef<number | null>(null);
  const isAutoPlayingRef = useRef<boolean>(false); // Ref to track auto-play state

  useEffect(() => {
    setHostname(window.location.hostname);
    // Check if there's an initialization error from the geminiService
    if (typeof window !== 'undefined' && (window as any).geminiInitializationError) {
      setError((window as any).geminiInitializationError);
      setStep(AppStep.Error);
    }
    
    // Add animation styles to the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      // Clean up the style element when component unmounts
      document.head.removeChild(styleElement);
      
      // Clear any pending timeouts
      if (numberAnimationTimeoutRef.current) {
        clearTimeout(numberAnimationTimeoutRef.current);
      }
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      // Reset auto-play ref on unmount
      isAutoPlayingRef.current = false;
    };
  }, []);

  const handleReset = useCallback(() => {
    setStep(AppStep.Initial);
    setRandomNumber(null);
    setMysticPhrase('');
    setPhraseExplanation('');
    setShowExplanation(false);
    setIsExplaining(false);
    setImageUrl('');
    setError('');
    setIsLoading(false);
    setIsAutoPlaying(false);
    setShowNumberAnimation(false);
    setIsGeneratingPostcard(false);
    
    // Clear any pending auto-play timeouts
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    
    if (typeof window !== 'undefined' && (window as any).geminiInitializationError) {
      setError((window as any).geminiInitializationError);
      setStep(AppStep.Error);
    }
  }, []);

  const handleGenerateNumber = useCallback(() => {
    const num = Math.floor(Math.random() * 9999) + 1;
    console.log('Auto-play: Generated random number:', num);
    
    // Set the number immediately so it's available for the next step
    setRandomNumber(num);
    setShowNumberAnimation(true);
    
    // After animation completes, proceed to next step
    numberAnimationTimeoutRef.current = window.setTimeout(() => {
      console.log('Auto-play: Number animation complete, proceeding to next step');
      setStep(AppStep.NumberGenerated);
      
      // Check the ref instead of the state for auto-play status
      if (isAutoPlayingRef.current) {
        console.log('Auto-play: Number generated, pausing for 2 seconds before continuing...');
        
        // Add a 2-second pause before continuing to phrase generation
        autoPlayTimeoutRef.current = window.setTimeout(() => {
          console.log('Auto-play: Pause complete, continuing to phrase generation...');
          // Use the current number directly instead of relying on state
          setIsLoading(true);
          setError('');
          
          generateMysticPhrase(num)
            .then(phrase => {
              console.log('Auto-play: Phrase generated:', phrase);
              setMysticPhrase(phrase);
              setStep(AppStep.PhraseGenerated);
              setIsLoading(false);
              
              // Continue to explanation generation immediately
              if (isAutoPlayingRef.current) {
                console.log('Auto-play: Generating explanation for phrase');
                generatePhraseExplanation(phrase)
                  .then(explanation => {
                    console.log('Auto-play: Explanation generated:', explanation.substring(0, 50) + '...');
                    setPhraseExplanation(explanation);
                    
                    // Show explanation after a short delay
                    if (isAutoPlayingRef.current) {
                      autoPlayTimeoutRef.current = window.setTimeout(() => {
                        console.log('Auto-play: Revealing explanation');
                        setIsExplaining(true);
                        setShowExplanation(true);
                        
                        // Continue to image generation after explanation is shown
                        if (isAutoPlayingRef.current) {
                          autoPlayTimeoutRef.current = window.setTimeout(() => {
                            console.log('Auto-play: Explanation revealed, continuing to image generation...');
                            setIsExplaining(false);
                            setIsLoading(true);
                            
                            // Generate the image
                            generateEnigmaticImage(phrase, ImageStyle.HUMAN_FORM)
                              .then(url => {
                                console.log('Auto-play: Image generated successfully');
                                setImageUrl(url);
                                setStep(AppStep.ImageGenerated);
                                setIsLoading(false);
                                setIsAutoPlaying(false);
                                isAutoPlayingRef.current = false; // Update ref
                                console.log('Auto-play: Complete!');
                              })
                              .catch(e => {
                                console.error('Auto-play: Image generation failed', e);
                                setError(e instanceof Error ? e.message : 'An unknown error occurred.');
                                setStep(AppStep.Error);
                                setIsAutoPlaying(false);
                                isAutoPlayingRef.current = false; // Update ref
                                setIsLoading(false);
                              });
                          }, 3000);
                        }
                      }, 1000);
                    }
                  })
                  .catch(e => {
                    console.error('Auto-play: Explanation generation failed', e);
                    setError(e instanceof Error ? e.message : 'An unknown error occurred.');
                    setShowExplanation(false);
                    setIsExplaining(false);
                    setIsAutoPlaying(false);
                    isAutoPlayingRef.current = false; // Update ref
                  });
              }
            })
            .catch(e => {
              console.error('Auto-play: Phrase generation failed', e);
              setError(e instanceof Error ? e.message : 'An unknown error occurred.');
              setStep(AppStep.Error);
              setIsAutoPlaying(false);
              isAutoPlayingRef.current = false; // Update ref
              setIsLoading(false);
            });
        }, 2000);
      }
    }, 2500); // Slightly longer than animation duration to ensure completion
  }, []); // Remove isAutoPlaying from dependencies since we use the ref

  const handleGenerateImage = useCallback(async () => {
    if (!mysticPhrase) return;
    setIsLoading(true);
    setError('');
    try {
      // When auto-playing, always use HUMAN_FORM style
      const styleToUse = isAutoPlayingRef.current ? ImageStyle.HUMAN_FORM : selectedStyle;
      const url = await generateEnigmaticImage(mysticPhrase, styleToUse);
      setImageUrl(url);
      setStep(AppStep.ImageGenerated);
      if (!isAutoPlayingRef.current) {
        setShowExplanation(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStep(AppStep.Error);
      setIsAutoPlaying(false);
    } finally {
      setIsLoading(false);
      setIsAutoPlaying(false); // End auto-play when reaching the final step
      isAutoPlayingRef.current = false; // Update ref
    }
  }, [mysticPhrase, selectedStyle]);
  
  const handleGeneratePhrase = useCallback(async () => {
    if (randomNumber === null) return;
    setIsLoading(true);
    setError('');
    try {
      // Generate both the phrase and explanation at the same time
      const phrase = await generateMysticPhrase(randomNumber);
      setMysticPhrase(phrase);
      
      // Generate the explanation immediately but don't show it yet
      const explanation = await generatePhraseExplanation(phrase);
      setPhraseExplanation(explanation);
      
      setStep(AppStep.PhraseGenerated);
      
      // If auto-playing, continue to the next step after a delay
      if (isAutoPlayingRef.current) {
        console.log('Auto-play: Phrase and explanation generated, continuing to reveal explanation...');
        autoPlayTimeoutRef.current = window.setTimeout(() => {
          setShowExplanation(true);
          setIsExplaining(true);
          
          // Continue to image generation after explanation is shown
          setTimeout(() => {
            setIsExplaining(false);
            console.log('Auto-play: Explanation revealed, continuing to image generation...');
            handleGenerateImage();
          }, 3000);
        }, 2000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStep(AppStep.Error);
      setIsAutoPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [randomNumber, handleGenerateImage]);
  
  const handleExplainPhrase = useCallback(async () => {
    if (!mysticPhrase) return;
    setIsExplaining(true);
    setError('');
    try {
      // Just show the explanation since we already generated it
      setShowExplanation(true);
      return phraseExplanation;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setShowExplanation(false);
      return null;
    } finally {
      setIsExplaining(false);
    }
  }, [mysticPhrase, phraseExplanation]);
  
  const handleCreatePostcard = useCallback(async () => {
    if (!imageUrl || !mysticPhrase) return;
    
    // If explanation isn't shown yet but exists, make sure to include it in the postcard
    let explanationToUse = phraseExplanation;
    if (!explanationToUse && !showExplanation) {
      try {
        explanationToUse = await generatePhraseExplanation(mysticPhrase);
      } catch (e) {
        console.error('Failed to generate explanation for postcard:', e);
      }
    }
    
    setIsGeneratingPostcard(true);
    try {
      // Pass true as the fifth parameter to ensure square aspect ratio (1:1)
      await generatePostcard(
        imageUrl,
        mysticPhrase,
        explanationToUse || null,
        `enigmatic-postcard-${randomNumber}`,
        true // Force square aspect ratio
      );
    } catch (e) {
      console.error('Failed to generate postcard:', e);
    } finally {
      setIsGeneratingPostcard(false);
    }
  }, [imageUrl, mysticPhrase, phraseExplanation, randomNumber, showExplanation]);
  
  const handleStartAutoPlay = useCallback(() => {
    // Clear any existing timeouts first
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    
    // Reset any previous state
    setShowNumberAnimation(false);
    setRandomNumber(null);
    setMysticPhrase('');
    setPhraseExplanation('');
    setShowExplanation(false);
    setIsExplaining(false);
    setImageUrl('');
    setError('');
    setStep(AppStep.Initial); // Reset to initial step
    
    // Update both state and ref for auto-play
    setIsAutoPlaying(true);
    isAutoPlayingRef.current = true;
    console.log('Auto-play: Starting auto-play sequence');
    
    // Set the default style to HUMAN_FORM for auto-play
    setSelectedStyle(ImageStyle.HUMAN_FORM);
    
    // Start the flow after a short delay to ensure state is updated
    autoPlayTimeoutRef.current = window.setTimeout(() => {
      console.log('Auto-play: Generating number...');
      handleGenerateNumber();
    }, 200);
  }, [handleGenerateNumber]);

  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }
    if (step === AppStep.Error) {
      return (
        <div className="text-center animate-fade-in max-w-2xl w-full">
          <h2 className="text-2xl font-thin text-slate-800 mb-4">A Configuration Error Occurred</h2>
          <div className="text-red-600/90 mb-6 text-base bg-red-100/50 p-4 rounded-lg text-left">
            <p className="font-medium">Error Details:</p>
            <p>{error}</p>
          </div>
          <div className="text-left bg-slate-100 p-4 rounded-lg text-sm text-slate-600">
            <p className="font-medium mb-2 text-slate-700">Troubleshooting Steps:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Ensure your API key is correctly set in your deployment service's environment variables.</li>
              <li>Go to your Google Cloud Console for this project.</li>
              <li>Navigate to "APIs & Services" &gt; "Credentials".</li>
              <li>Find your API key and check its "Application restrictions".</li>
              <li>
                Under "Website restrictions", make sure the following hostname is added to the allowed sites:
                <code className="block bg-slate-200 text-slate-800 p-2 rounded text-sm my-2 text-center font-mono">{hostname || 'loading...'}</code>
              </li>
            </ol>
          </div>
          <ActionButton onClick={handleReset} className="mt-8">Try Again</ActionButton>
        </div>
      );
    }

    switch (step) {
      case AppStep.Initial:
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl font-thin text-slate-800 mb-2 tracking-widest">ENIGMA</h1>
            <p className="text-slate-500 mb-10 font-light">Begin the journey into the abstract.</p>
            <div className="flex items-center justify-center gap-4">
              <ActionButton onClick={handleGenerateNumber}>Consult the Oracle</ActionButton>
              <AutoPlayButton 
                onClick={handleStartAutoPlay} 
                disabled={isAutoPlayingRef.current}
              />
            </div>
          </div>
        );
      case AppStep.NumberGenerated:
        return (
          <div className="text-center animate-fade-in">
            <p className="text-slate-500 mb-4 font-light">The cosmos has chosen a number:</p>
            <div className="h-[96px] flex items-center justify-center">
              {showNumberAnimation ? (
                <NumberAnimation 
                  targetNumber={randomNumber || 0} 
                  onComplete={() => setShowNumberAnimation(false)}
                />
              ) : (
                <p className="text-7xl font-thin text-slate-800 tracking-wider font-mono">{randomNumber?.toString().padStart(4, '0')}</p>
              )}
            </div>
            <ActionButton 
              onClick={handleGeneratePhrase} 
              disabled={isAutoPlayingRef.current}
            >
              Channel the Cosmos
            </ActionButton>
          </div>
        );
      case AppStep.PhraseGenerated:
        return (
          <div className="text-center animate-fade-in max-w-2xl">
            <div className="relative min-h-[200px] mb-10">
              <div 
                ref={phraseRef}
                className={`transition-all duration-1000 ease-in-out ${showExplanation ? 'transform -translate-y-16' : ''}`}
              >
                <p className="text-slate-500 mb-4 font-light">From the ether, a thought emerges:</p>
                <div className="relative">
                  <p className="text-3xl font-thin text-slate-800/90 italic mb-4">"{mysticPhrase}"</p>
                  <MediaControls text={mysticPhrase} fileName={`enigmatic-phrase-${randomNumber}`} />
                </div>
                
                {!showExplanation && (
                  <div className="flex justify-center mt-4">
                    <button 
                      onClick={handleExplainPhrase}
                      disabled={isExplaining}
                      className={`
                        px-4 py-2 rounded-lg transition-all text-sm
                        ${isExplaining ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}
                      `}
                    >
                      {isExplaining ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Interpreting...
                        </span>
                      ) : (
                        'Reveal Meaning'
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              {showExplanation && (
                <div className="mt-8 animate-fade-in">
                  {phraseExplanation ? (
                    <p className="text-lg font-light text-slate-700 italic bg-slate-100/70 p-4 rounded-lg">{phraseExplanation}</p>
                  ) : (
                    <div className="flex justify-center items-center h-16">
                      <Spinner />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <p className="text-slate-500 mb-4 font-light">Choose a form of the vision:</p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setSelectedStyle(ImageStyle.HUMAN_FORM)}
                  className={`px-4 py-2 rounded-lg transition-all ${selectedStyle === ImageStyle.HUMAN_FORM ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  Human Form
                </button>
                <button 
                  onClick={() => setSelectedStyle(ImageStyle.COSMIC_ENTITY)}
                  className={`px-4 py-2 rounded-lg transition-all ${selectedStyle === ImageStyle.COSMIC_ENTITY ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  Cosmic Entity
                </button>
              </div>
            </div>
            
            <ActionButton onClick={handleGenerateImage}>Visualize the Enigma</ActionButton>
          </div>
        );
      case AppStep.ImageGenerated:
        return (
          <div className="text-center animate-fade-in">
            <div className="mb-8 w-full max-w-2xl aspect-square bg-slate-200/50 rounded-lg overflow-hidden shadow-2xl relative">
              <img src={imageUrl} alt={mysticPhrase} className="w-full h-full object-cover" />
              <MediaControls imageUrl={imageUrl} fileName={`enigmatic-vision-${randomNumber}`} />
              
              {/* Invisible postcard download button covering the entire image */}
              <button 
                onClick={handleCreatePostcard}
                className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                aria-label="Create postcard"
                title="Click anywhere on the image to create a postcard"
              />
              
              {isGeneratingPostcard && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <Spinner />
                    <p className="mt-2 text-sm">Creating postcard...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative inline-block mb-6">
              <p className="text-xl font-thin text-slate-600/90 italic max-w-2xl">"{mysticPhrase}"</p>
              <MediaControls text={mysticPhrase} fileName={`enigmatic-phrase-${randomNumber}`} />
            </div>
            
            {phraseExplanation && (
              <div className="mb-8 animate-fade-in max-w-2xl mx-auto">
                <p className="text-lg font-light text-slate-700 italic bg-slate-100/70 p-4 rounded-lg">{phraseExplanation}</p>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mb-10">
              <ActionButton onClick={handleReset}>Begin Anew</ActionButton>
              <ActionButton onClick={() => {
                setIsLoading(true);
                // Generate a new image with the same phrase but toggle the style
                const newStyle = selectedStyle === ImageStyle.HUMAN_FORM ? ImageStyle.COSMIC_ENTITY : ImageStyle.HUMAN_FORM;
                setSelectedStyle(newStyle);
                generateEnigmaticImage(mysticPhrase, newStyle)
                  .then(url => {
                    setImageUrl(url);
                  })
                  .catch(e => {
                    setError(e instanceof Error ? e.message : 'An unknown error occurred.');
                    setStep(AppStep.Error);
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}>Try Other Style</ActionButton>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <div className="max-w-4xl w-full app-container auto-play-transition">
        {renderContent()}
      </div>
    </div>
  );
};

// CSS for animations
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.animate-fade-out {
  animation: fadeOut 0.8s ease-in-out forwards;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.auto-play-transition {
  transition: opacity 1.2s ease-in-out;
}
`;

export default App;