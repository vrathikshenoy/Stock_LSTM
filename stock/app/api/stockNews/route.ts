import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
  thumbnail?: {
    resolutions: Array<{
      url: string;
      width: number;
      height: number;
      tag: string;
    }>;
  };
}

// For Next.js 13/14 App Router
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol");
  const count = parseInt(url.searchParams.get("count") || "10");

  if (!symbol) {
    return NextResponse.json({ error: "No symbol provided" }, { status: 400 });
  }

  try {
    const news = await getStockNews(symbol, count);
    return NextResponse.json(news);
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch stock news" },
      { status: 500 },
    );
  }
}

// For Next.js 13/14 Pages Router
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symbol, count } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "No symbol provided" });
  }

  try {
    const news = await getStockNews(symbol, parseInt(count || "10"));
    return res.status(200).json(news);
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return res.status(500).json({ error: "Failed to fetch stock news" });
  }
}

async function getStockNews(symbol: string, count = 10): Promise<NewsItem[]> {
  try {
    const result = await yahooFinance.search(symbol, { newsCount: count });
    return result.news || [];
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
}
