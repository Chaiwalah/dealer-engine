
import { GoogleGenAI } from "@google/genai";
import { EngineState, ChartDataPoint } from "../types";

// Safe AI Initializer
const getAI = () => {
    const key = process.env.API_KEY || (window as any).process?.env?.API_KEY;
    if (!key || key.trim() === '') return null;
    return new GoogleGenAI({ apiKey: key });
};

// --- MARKET NARRATIVE (Existing) ---
export const generateMarketNarrative = async (
  symbol: string, 
  state: EngineState, 
  chartData: ChartDataPoint[]
): Promise<string[]> => {
  const recentTrend = chartData.slice(-10).map(c => c.price.toFixed(2)).join(', ');
  
  const fallbackNarrative = [
     `⚠️ NEURAL UPLINK OFFLINE: Showing heuristic analysis for ${symbol}.`,
     state.oiMomentum > 0 
        ? `Open Interest expanding (${state.oiMomentum.toFixed(2)}%) indicates active positioning.` 
        : `Open Interest decaying (${state.oiMomentum.toFixed(2)}%) suggests capital flight.`,
     state.fundingRate > 0.01 
        ? "Funding positive; long bias detected but expensive." 
        : "Funding neutral/negative; contrarian long opportunity present."
  ];

  try {
    const ai = getAI();
    if (!ai) return fallbackNarrative;

    const prompt = `
      Role: You are 'The Dealer', a high-frequency trading AI.
      Task: Create a 3-bullet executive summary for ${symbol}.
      
      Metrics:
      - Price: ${state.price}
      - REI Score: ${state.reiScore} (0-100, >70 Bull, <30 Bear)
      - Funding: ${state.fundingRate.toFixed(4)}%
      - Trend: ${recentTrend}

      Format: JSON array of 3 short, punchy strings.
      Example: ["Liquidity grab at highs.", "Short squeeze imminent.", "Accumulation detected."]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: { parts: [{ text: prompt }] },
    });
    
    let text = response.text;
    if (text) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) return json;
        } catch (e) {
           return text.split('\n').filter(s => s.trim().length > 5).slice(0, 3);
        }
    }
  } catch (error) {
    console.warn("AI Service unavailable, switching to local heuristics.", error);
    return fallbackNarrative;
  }

  return fallbackNarrative;
};

// --- VISION ANALYSIS (Existing) ---
export const analyzeUploadedImage = async (base64Data: string, userPrompt: string): Promise<string> => {
    try {
        const ai = getAI();
        if (!ai) return "Visual Processing Module Offline. Please verify API configuration.";

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', 
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: userPrompt || "Analyze this chart structure." }
                ]
            }
        });
        return response.text || "No analysis returned.";
    } catch (error) {
        console.error("Vision Analysis Error:", error);
        return "Visual processing failed. The network request was blocked or the API key is invalid.";
    }
};

// --- VEO VIDEO GENERATION (New) ---
export const generateVeoVideo = async (
    prompt: string, 
    imageBase64: string, 
    aspectRatio: '16:9' | '9:16'
): Promise<string> => {
    const ai = getAI();
    if (!ai) throw new Error("API Key missing");

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || "Animate this scene naturally",
            image: {
                imageBytes: imageBase64,
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("No video URI returned");

        // Fetch with API Key authentication
        const key = process.env.API_KEY || (window as any).process?.env?.API_KEY;
        const response = await fetch(`${videoUri}&key=${key}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Veo Generation Error:", error);
        throw error;
    }
};

// --- IMAGE GENERATION (New) ---
export const generateGenAIImage = async (
    prompt: string, 
    size: '1K' | '2K' | '4K'
): Promise<string> => {
    const ai = getAI();
    if (!ai) throw new Error("API Key missing");

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', // Nano Banana Pro
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: size
                }
            }
        });

        // Extract image from parts
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data found in response");
    } catch (error) {
        console.error("Image Generation Error:", error);
        throw error;
    }
};

// --- CHATBOT (New) ---
export const createDealerChat = () => {
    const ai = getAI();
    if (!ai) return null;
    
    return ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: "You are 'The Dealer', an elite crypto trading terminal AI. You are concise, professional, and use trading terminology (order flow, liquidity, CVD, delta). Answer questions about the market, trading strategies, or the terminal's features."
        }
    });
};
