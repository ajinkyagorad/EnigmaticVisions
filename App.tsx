import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateMysticPhrase, generateEnigmaticImage, generatePhraseExplanation, ImageStyle } from './services/geminiService';
import ActionButton from './components/ActionButton';
import Spinner from './components/Spinner';
import MediaControls from './components/MediaControls';

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
  const phraseRef = useRef<HTMLDivElement>(null);

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
    if (typeof window !== 'undefined' && (window as any).geminiInitializationError) {
      setError((window as any).geminiInitializationError);
      setStep(AppStep.Error);
    }
  }, []);

  const handleGenerateNumber = useCallback(() => {
    const num = Math.floor(Math.random() * 9999) + 1;
    setRandomNumber(num);
    setStep(AppStep.NumberGenerated);
  }, []);

  const handleGeneratePhrase = useCallback(async () => {
    if (randomNumber === null) return;
    setIsLoading(true);
    setError('');
    try {
      const phrase = await generateMysticPhrase(randomNumber);
      setMysticPhrase(phrase);
      setStep(AppStep.PhraseGenerated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStep(AppStep.Error);
    } finally {
      setIsLoading(false);
    }
  }, [randomNumber]);

  const handleGenerateImage = useCallback(async () => {
    if (!mysticPhrase) return;
    setIsLoading(true);
    setError('');
    try {
      const url = await generateEnigmaticImage(mysticPhrase, selectedStyle);
      setImageUrl(url);
      setStep(AppStep.ImageGenerated);
      // Reset explanation state when moving to image generation
      setShowExplanation(false);
      setPhraseExplanation('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStep(AppStep.Error);
    } finally {
      setIsLoading(false);
    }
  }, [mysticPhrase, selectedStyle]);
  
  const handleExplainPhrase = useCallback(async () => {
    if (!mysticPhrase) return;
    setIsExplaining(true);
    setError('');
    try {
      // First animate the phrase moving up
      setShowExplanation(true);
      
      // Then get the explanation
      const explanation = await generatePhraseExplanation(mysticPhrase);
      setPhraseExplanation(explanation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setShowExplanation(false);
    } finally {
      setIsExplaining(false);
    }
  }, [mysticPhrase]);

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
            <ActionButton onClick={handleGenerateNumber}>Consult the Oracle</ActionButton>
          </div>
        );
      case AppStep.NumberGenerated:
        return (
          <div className="text-center animate-fade-in">
            <p className="text-slate-500 mb-4 font-light">The cosmos has chosen a number:</p>
            <p className="text-7xl font-thin text-slate-800 mb-10 tracking-wider">{randomNumber}</p>
            <ActionButton onClick={handleGeneratePhrase}>Weave a Mystic Phrase</ActionButton>
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
            </div>
            <div className="relative inline-block">
              <p className="text-xl font-thin text-slate-600/90 italic mb-10 max-w-2xl">"{mysticPhrase}"</p>
              <MediaControls text={mysticPhrase} fileName={`enigmatic-phrase-${randomNumber}`} />
            </div>
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
    <div className="bg-gray-50 text-slate-700 min-h-screen flex flex-col items-center justify-center p-4 selection:bg-slate-300/50">
      <div className="w-full max-w-4xl flex items-center justify-center transition-all duration-500 ease-in-out">
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
`;

export default App;