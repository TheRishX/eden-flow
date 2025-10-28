import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const plugins = [];

if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
} else {
  console.warn(
    'GEMINI_API_KEY or GOOGLE_API_KEY not found. AI features will be disabled.'
  );
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.5-flash',
});
