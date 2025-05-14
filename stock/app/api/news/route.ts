import { NextResponse } from "next/server";
import { getMarketNews, getStockNews } from "@/services/geminiNewsService";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const market = url.searchParams.get("market") || "global";
  const count = parseInt(url.searchParams.get("count") || "20");
  const symbol = url.searchParams.get("symbol");

  try {
    if (symbol) {
      const news = await getStockNews(symbol, count);
      return NextResponse.json(news);
    }
    // Otherwise fetch market news
    else {
      const news = await getMarketNews(market, count);
      return NextResponse.json(news);
    }
  } catch (error) {
    console.error(`Error fetching news:`, error);
    return NextResponse.json(
      { error: `Failed to fetch financial news` },
      { status: 500 },
    );
  }
}
