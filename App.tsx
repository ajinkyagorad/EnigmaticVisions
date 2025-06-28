import React, { useState, useCallback, useEffect } from 'react';
import { generateMysticPhrase, generateEnigmaticImage } from './services/geminiService';
import ActionButton from './components/ActionButton';
import Spinner from './components/Spinner';

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
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hostname, setHostname] = useState<string>('');

  useEffect(() => {
    setHostname(window.location.hostname);
    // Check if there's an initialization error from the geminiService
    if (typeof window !== 'undefined' && (window as any).geminiInitializationError) {
      setError((window as any).geminiInitializationError);
      setStep(AppStep.Error);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStep(AppStep.Initial);
    setRandomNumber(null);
    setMysticPhrase('');
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
      const url = await generateEnigmaticImage(mysticPhrase);
      setImageUrl(url);
      setStep(AppStep.ImageGenerated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStep(AppStep.Error);
    } finally {
      setIsLoading(false);
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
            <p className="text-slate-500 mb-4 font-light">From the ether, a thought emerges:</p>
            <p className="text-3xl font-thin text-slate-800/90 italic mb-10">"{mysticPhrase}"</p>
            <ActionButton onClick={handleGenerateImage}>Visualize the Enigma</ActionButton>
          </div>
        );
      case AppStep.ImageGenerated:
        return (
          <div className="text-center animate-fade-in">
            <div className="mb-8 w-full max-w-2xl aspect-square bg-slate-200/50 rounded-lg overflow-hidden shadow-2xl">
              <img src={imageUrl} alt={mysticPhrase} className="w-full h-full object-cover" />
            </div>
            <p className="text-xl font-thin text-slate-600/90 italic mb-10 max-w-2xl">"{mysticPhrase}"</p>
            <ActionButton onClick={handleReset}>Begin Anew</ActionButton>
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

export default App;