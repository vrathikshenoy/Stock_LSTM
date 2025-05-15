"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface StockRecommendation {
  symbol: string;
  name: string;
  recommendation: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
  targetPrice: number;
  currentPrice: number;
  potentialGrowth: number;
  rationale: string;
  riskLevel: "Low" | "Medium" | "High";
  sector: string;
  timeHorizon: string;
}

export async function getStockRecommendations(): Promise<
  StockRecommendation[]
> {
  try {
    // Initialize the Gemini API with the API key
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    // Create a prompt that asks for stock recommendations
    const prompt = `
      As a financial expert, provide me with a list of 10 stock recommendations based on past performance and future market outlook.
      
      For each stock, include:
      1. Symbol (ticker)
      2. Company name
      3. Recommendation (Strong Buy, Buy, Hold, Sell, or Strong Sell)
      4. Current price (approximate in USD, or INR for Indian stocks)
      5. Target price (approximate in USD, or INR for Indian stocks)
      6. Potential growth percentage
      7. Brief rationale for the recommendation (2-3 sentences)
      8. Risk level (Low, Medium, High)
      9. Sector
      10. Time horizon (Short-term, Medium-term, Long-term)
      
      Include a mix of US and Indian stocks. For Indian stocks, use the .NS suffix for NSE listings.
      
      Format the response as a JSON array with the following structure:
      [
        {
          "symbol": "AAPL",
          "name": "Apple Inc.",
          "recommendation": "Buy",
          "currentPrice": 170.50,
          "targetPrice": 200.00,
          "potentialGrowth": 17.3,
          "rationale": "Strong ecosystem and services growth with potential new product categories.",
          "riskLevel": "Low",
          "sector": "Technology",
          "timeHorizon": "Long-term"
        },
        ...
      ]
    `;

    // Generate content using the Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON part from the response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from the response");
    }

    const jsonStr = jsonMatch[0];
    const recommendations = JSON.parse(jsonStr) as StockRecommendation[];

    return recommendations;
  } catch (error) {
    console.error("Error getting stock recommendations:", error);
    throw new Error("Failed to get stock recommendations");
  }
}
