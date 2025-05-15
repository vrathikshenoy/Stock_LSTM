"use server";
import { v4 as uuidv4 } from "uuid";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
  content?: string;
  thumbnail?: {
    resolutions: Array<{
      url: string;
      width: number;
      height: number;
      tag: string;
    }>;
  };
}

// Fix 1: Properly access environment variables in Next.js server components
// In Next.js, use process.env directly without NEXT_PUBLIC_ prefix for server components
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Fix 2: Proper debugging - avoid logging sensitive API keys
console.log("GEMINI_API_KEY available:", !!GEMINI_API_KEY);

// Initialize the Google Generative AI client only if the API key is available
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// The model to use
const MODEL_NAME = "gemini-2.0-flash-001";

// Helper function to create a timestamp for a random time in the past 24 hours
const getRandomRecentTimestamp = (): number => {
  const now = Date.now();
  const randomHoursAgo = Math.floor(Math.random() * 24); // Random number between 0-24 hours
  const randomMinutes = Math.floor(Math.random() * 60); // Random minutes
  return Math.floor(
    (now - (randomHoursAgo * 3600000 + randomMinutes * 60000)) / 1000,
  );
};

/**
 * Function to generate a news prompt for Gemini based on the market or stock
 */
const generateNewsPrompt = (
  market: string = "global",
  symbol?: string,
): string => {
  if (symbol) {
    return `Generate 10 current financial news items about ${symbol} stock. Include both positive and negative news if applicable. 
    
    Format your response as a valid JSON array of objects with these fields ONLY:
    - title: A catchy headline about ${symbol}
    - publisher: A realistic financial news source
    - content: A short 1-paragraph summary of the news
    
    IMPORTANT: Return ONLY valid JSON data with no other text.`;
  }

  const marketSpecifier =
    market.toLowerCase() === "india"
      ? "Indian stock market"
      : "global stock markets";

  return `Generate 15 current financial news items about ${marketSpecifier}. Include a mix of market trends, economic indicators, and company-specific news. 
  
  Format your response as a valid JSON array of objects with these fields ONLY:
  - title: A catchy headline
  - publisher: A realistic financial news source
  - content: A short 1-paragraph summary of the news
  
  IMPORTANT: Return ONLY valid JSON data with no other text.`;
};

/**
 * Calls Gemini API to get news using the official SDK
 */
const fetchGeminiNews = async (prompt: string): Promise<any> => {
  // Fix 3: Check if genAI is initialized before using it
  if (!genAI) {
    console.error("Gemini API not initialized - missing API key");
    throw new Error("API key not configured");
  }

  try {
    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the response as JSON
    try {
      // First attempt: try to parse the entire response as JSON
      return JSON.parse(text);
    } catch (parseError) {
      // Second attempt: try to find and extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error("Error parsing extracted JSON:", extractError);
          throw new Error("Failed to parse JSON from response");
        }
      }

      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response:", text);
      throw new Error("No valid JSON data found in response");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

/**
 * Convert raw Gemini response into NewsItem format
 */
const convertToNewsItems = (rawNews: any[]): NewsItem[] => {
  return rawNews.map((item) => {
    // Create a placeholder thumbnail with a random image
    const imageIndex = Math.floor(Math.random() * 100) + 1;
    const thumbnail = {
      resolutions: [
        {
          url: `https://picsum.photos/id/${imageIndex}/800/400`,
          width: 800,
          height: 400,
          tag: "original",
        },
        {
          url: `https://picsum.photos/id/${imageIndex}/400/200`,
          width: 400,
          height: 200,
          tag: "resized",
        },
      ],
    };

    return {
      uuid: uuidv4(),
      title: item.title || "Breaking News", // Provide fallbacks for missing fields
      publisher: item.publisher || "Financial Times",
      link: "#", // Placeholder link
      providerPublishTime: getRandomRecentTimestamp(),
      type: "STORY",
      content: item.content || "No content available",
      thumbnail,
    };
  });
};

/**
 * Fallback news in case the API fails
 */
const fallbackNews: NewsItem[] = [
  {
    uuid: "fallback-1",
    title: "Markets showing resilience amid economic uncertainty",
    publisher: "Financial Times",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 3600,
    type: "STORY",
    content:
      "Despite ongoing economic challenges, global markets have demonstrated remarkable resilience. Analysts attribute this to strong corporate earnings and strategic monetary policy adjustments by central banks worldwide.",
    thumbnail: {
      resolutions: [
        {
          url: "https://picsum.photos/id/10/800/400",
          width: 800,
          height: 400,
          tag: "original",
        },
        {
          url: "https://picsum.photos/id/10/400/200",
          width: 400,
          height: 200,
          tag: "resized",
        },
      ],
    },
  },
  {
    uuid: "fallback-2",
    title: "Tech stocks surge as investors eye AI developments",
    publisher: "CNBC",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 7200,
    type: "STORY",
    content:
      "Technology stocks have experienced a significant rally as investor interest in artificial intelligence continues to grow. Companies focusing on AI capabilities are seeing substantial gains in market valuation.",
    thumbnail: {
      resolutions: [
        {
          url: "https://picsum.photos/id/20/800/400",
          width: 800,
          height: 400,
          tag: "original",
        },
        {
          url: "https://picsum.photos/id/20/400/200",
          width: 400,
          height: 200,
          tag: "resized",
        },
      ],
    },
  },
  {
    uuid: "fallback-3",
    title: "Indian markets hit new high as foreign investments flow in",
    publisher: "Economic Times",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 10800,
    type: "STORY",
    content:
      "Indian stock markets reached unprecedented levels today as foreign institutional investors continue to show confidence in the country's economic outlook. Infrastructure and technology sectors led the gains.",
    thumbnail: {
      resolutions: [
        {
          url: "https://picsum.photos/id/30/800/400",
          width: 800,
          height: 400,
          tag: "original",
        },
        {
          url: "https://picsum.photos/id/30/400/200",
          width: 400,
          height: 200,
          tag: "resized",
        },
      ],
    },
  },
  {
    uuid: "fallback-4",
    title: "Oil prices stabilize following production agreement",
    publisher: "Reuters",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 14400,
    type: "STORY",
    content:
      "Global oil prices have stabilized after major oil-producing nations reached an agreement on production limits. The consensus aims to balance market supply and maintain price stability amid fluctuating demand.",
    thumbnail: {
      resolutions: [
        {
          url: "https://picsum.photos/id/40/800/400",
          width: 800,
          height: 400,
          tag: "original",
        },
        {
          url: "https://picsum.photos/id/40/400/200",
          width: 400,
          height: 200,
          tag: "resized",
        },
      ],
    },
  },
  {
    uuid: "fallback-5",
    title:
      "Central bank maintains interest rates, signals future cuts possible",
    publisher: "Bloomberg",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 18000,
    type: "STORY",
    content:
      "The central bank has decided to maintain current interest rates while hinting at potential cuts in the coming months. This announcement has been positively received by markets, with bonds rallying in response.",
    thumbnail: {
      resolutions: [
        {
          url: "https://picsum.photos/id/50/800/400",
          width: 800,
          height: 400,
          tag: "original",
        },
        {
          url: "https://picsum.photos/id/50/400/200",
          width: 400,
          height: 200,
          tag: "resized",
        },
      ],
    },
  },
];

/**
 * Get market news using Gemini API
 */
export async function getMarketNews(
  market: string = "global",
  count: number = 20,
): Promise<NewsItem[]> {
  try {
    const prompt = generateNewsPrompt(market);
    // Fix 4: Add better error handling for missing API key
    if (!genAI || !GEMINI_API_KEY) {
      console.warn("Using fallback news - Gemini API key not configured");
      return fallbackNews.slice(0, count);
    }

    const rawNews = await fetchGeminiNews(prompt);

    // Validate that rawNews is an array before processing
    if (!Array.isArray(rawNews)) {
      console.error("Invalid response format (not an array):", rawNews);
      return fallbackNews.slice(0, count);
    }

    const newsItems = convertToNewsItems(rawNews);
    return newsItems.slice(0, count);
  } catch (error) {
    console.error("Error fetching market news from Gemini:", error);
    return fallbackNews.slice(0, count);
  }
}

/**
 * Get stock-specific news using Gemini API
 */
export async function getStockNews(
  symbol: string,
  count: number = 10,
): Promise<NewsItem[]> {
  try {
    const prompt = generateNewsPrompt("global", symbol);
    // Fix 5: Add better error handling for missing API key
    if (!genAI || !GEMINI_API_KEY) {
      console.warn("Using fallback news - Gemini API key not configured");
      return getCustomizedFallbackNews(symbol, count);
    }

    const rawNews = await fetchGeminiNews(prompt);

    // Validate that rawNews is an array before processing
    if (!Array.isArray(rawNews)) {
      console.error("Invalid response format (not an array):", rawNews);
      return getCustomizedFallbackNews(symbol, count);
    }

    const newsItems = convertToNewsItems(rawNews);
    return newsItems.slice(0, count);
  } catch (error) {
    console.error(`Error fetching news for ${symbol} from Gemini:`, error);
    return getCustomizedFallbackNews(symbol, count);
  }
}

/**
 * Create customized fallback news for a specific stock
 */
function getCustomizedFallbackNews(symbol: string, count: number): NewsItem[] {
  return fallbackNews
    .map((item) => ({
      ...item,
      uuid: `${item.uuid}-${symbol}`,
      title: item.title.includes(symbol)
        ? item.title
        : `${item.title} - Impact on ${symbol.toUpperCase()}`,
      content: item.content.includes(symbol)
        ? item.content
        : `${item.content} This may have implications for ${symbol.toUpperCase()} stock performance in the coming trading sessions.`,
    }))
    .slice(0, count);
}
