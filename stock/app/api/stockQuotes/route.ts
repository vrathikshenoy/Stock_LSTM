// api/stockQuotes.ts or app/api/stockQuotes/route.ts (depending on your Next.js version)

import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: Date;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  marketCap?: number;
  currency: string;
}

// For Next.js 13/14 App Router
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const symbols = url.searchParams.get("symbols");

  if (!symbols) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 });
  }

  try {
    const symbolArray = symbols.split(",");
    const quotes = await fetchStockQuotes(symbolArray);
    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching stock quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock quotes" },
      { status: 500 },
    );
  }
}

// For Next.js 13/14 Pages Router
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: "No symbols provided" });
  }

  try {
    const symbolArray = Array.isArray(symbols) ? symbols : symbols.split(",");
    const quotes = await fetchStockQuotes(symbolArray);
    return res.status(200).json(quotes);
  } catch (error) {
    console.error("Error fetching stock quotes:", error);
    return res.status(500).json({ error: "Failed to fetch stock quotes" });
  }
}

async function fetchStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  // Create an array to hold all the stock quotes
  const quotes: StockQuote[] = [];

  // Process each symbol individually
  const promises = symbols.map(async (symbol) => {
    try {
      const quote = await yahooFinance.quoteSummary(symbol, {
        modules: ["price"],
      });

      const priceData = quote.price;
      return {
        symbol: priceData.symbol,
        shortName: priceData.shortName,
        regularMarketPrice: priceData.regularMarketPrice,
        regularMarketChange: priceData.regularMarketChange,
        regularMarketChangePercent: priceData.regularMarketChangePercent,
        regularMarketTime: new Date(priceData.regularMarketTime * 1000),
        regularMarketDayHigh: priceData.regularMarketDayHigh,
        regularMarketDayLow: priceData.regularMarketDayLow,
        regularMarketVolume: priceData.regularMarketVolume,
        marketCap: priceData.marketCap,
        currency: priceData.currency,
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      // Return null for failed quotes
      return null;
    }
  });

  // Wait for all requests to complete
  const results = await Promise.all(promises);

  // Filter out any null results (failed requests)
  return results.filter((quote) => quote !== null) as StockQuote[];
}
