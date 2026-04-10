import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export interface AnalyzeSmileResult {
  isSmiling: boolean;
  answer: 'YES' | 'NO';
  rawText: string;
}

function getGeminiApiKey(): string {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('Missing VITE_GEMINI_API_KEY in environment.');
  }

  return apiKey;
}

function parseSmileAnswer(text: string): 'YES' | 'NO' {
  const normalized = text.trim().toUpperCase();

  if (normalized.includes('YES')) {
    return 'YES';
  }

  if (normalized.includes('NO')) {
    return 'NO';
  }

  throw new Error(`Unexpected Gemini response for smile detection: ${text}`);
}

export async function analyzeSmileFromBase64Jpeg(base64Data: string): Promise<AnalyzeSmileResult> {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: [
      {
        parts: [
          { text: "Is this person smiling? Answer 'YES' or 'NO' only." },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    },
  });

  const rawText = response.text?.trim() ?? '';
  if (!rawText) {
    throw new Error('Gemini returned an empty response for smile detection.');
  }

  const answer = parseSmileAnswer(rawText);
  return {
    isSmiling: answer === 'YES',
    answer,
    rawText,
  };
}
