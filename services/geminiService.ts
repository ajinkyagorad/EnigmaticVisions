import { GoogleGenAI } from '@google/genai';

// Global error variable that can be accessed by the App component
declare global {
  interface Window {
    geminiInitializationError?: string;
  }
}

// Initialize the Gemini API client
let ai: GoogleGenAI | null = null;

try {
  // Check for API key in environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "API key not found. Please ensure you have set either VITE_GEMINI_API_KEY or GEMINI_API_KEY " +
      "in your Netlify environment variables."
    );
  }
  
  // Initialize the Gemini client
  ai = new GoogleGenAI({ apiKey });
  console.log("Gemini API client initialized successfully");
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Failed to initialize Gemini AI.";
  if (typeof window !== 'undefined') {
    window.geminiInitializationError = errorMessage;
  }
  console.error("Gemini initialization error:", errorMessage);
}

// Helper function to handle API errors
const getConfigurationError = (originalError: unknown) => {
  console.error("Gemini API Error:", originalError);
  const baseMessage = "The API call failed. This often happens in deployed apps due to API key domain restrictions.";
  if (originalError instanceof Error) {
    return new Error(`${baseMessage} Original error: ${originalError.message}`);
  }
  return new Error(`${baseMessage} An unknown error occurred.`);
};

/**
 * Generates a mystical phrase based on a seed number
 */
export const generateMysticPhrase = async (seedNumber: number): Promise<string> => {
  if (!ai) throw new Error(window.geminiInitializationError || "Gemini AI not initialized.");
  try {
    const prompt = `Based on the cosmic vibration of the number ${seedNumber}, generate a single, short, enigmatic, and mystical sentence. The sentence should feel abstract, profound, and like a fragment of a forgotten dream. Do not explain the sentence. Just provide the sentence.`;
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 1, topP: 0.95 }
    });
    return response.text?.trim() || "A cosmic whisper echoes through the void, unheard but felt.";
  } catch (error) {
    throw getConfigurationError(error);
  }
};

/**
 * Generates an explanation for a mystical phrase
 */
export const generatePhraseExplanation = async (phrase: string): Promise<string> => {
  if (!ai) throw new Error(window.geminiInitializationError || "Gemini AI not initialized.");
  try {
    const prompt = `The following is a mystical, enigmatic phrase: "${phrase}"

Provide a brief, insightful explanation of what this phrase might mean from a cosmic or philosophical perspective. Keep the explanation under 100 words, maintaining the same mystical and profound tone. The explanation should feel like it comes from the cosmos itself, revealing hidden wisdom.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.7, topP: 0.95 }
    });
    return response.text?.trim() || "The cosmos speaks in riddles that only the soul can truly comprehend.";
  } catch (error) {
    throw getConfigurationError(error);
  }
};

export enum ImageStyle {
  HUMAN_FORM = 'human_form',
  COSMIC_ENTITY = 'cosmic_entity'
}

/**
 * Get artistic flavor text based on the selected style
 */
const getArtisticFlavor = (style: ImageStyle): string => {
  switch (style) {
    case ImageStyle.HUMAN_FORM:
      return "ethereal human form with artsy morphing styles merging between objects, dreamlike quality, soft focus, surreal anatomical features, flowing forms, high resolution, atmospheric lighting, digital painting style";
    case ImageStyle.COSMIC_ENTITY:
      return "materialistic observation from another universe, alien geometry, impossible physics, cosmic entity, non-euclidean shapes, otherworldly textures, surreal concept-warping, morphing forms between states of matter, ethereal, mystical, dreamlike, enigmatic, high resolution, atmospheric lighting";
    default:
      return "ethereal, mystical, surreal, concept-warping, morphing forms, soft focus, dreamlike, enigmatic. A digital painting with the meta feeling of an Enigma (musical project) video cover art. High resolution, atmospheric lighting.";
  }
};

/**
 * Generates an enigmatic image based on a phrase and style
 */
export const generateEnigmaticImage = async (phrase: string, style: ImageStyle = ImageStyle.HUMAN_FORM): Promise<string> => {
  if (!ai) throw new Error(window.geminiInitializationError || "Gemini AI not initialized.");
  try {
    const artisticFlavor = getArtisticFlavor(style);
    const fullPrompt = `${phrase}. In the style of: ${artisticFlavor}`;
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: fullPrompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("The model did not return an image.");
  } catch (error) {
    throw getConfigurationError(error);
  }
};