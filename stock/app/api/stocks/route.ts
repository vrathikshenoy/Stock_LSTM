import { NextResponse } from "next/server"
import yahooFinance from "yahoo-finance2"

export async function POST(request: Request) {
  try {
    const { symbols, action } = await request.json()

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "Invalid symbols array" }, { status: 400 })
    }

    if (action === "quotes") {
      const quotes = await yahooFinance.quoteSummary(symbols, {
        modules: ["price"],
      })

      // Handle both single quote and multiple quotes
      const results = Array.isArray(quotes) ? quotes : [quotes]

      const formattedQuotes = results.map((quote) => {
        const priceData = quote.price

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
        }
      })

      return NextResponse.json(formattedQuotes)
    } else if (action === "news") {
      const symbol = symbols[0] // Use first symbol for news
      const result = await yahooFinance.search(symbol, { newsCount: 20 })
      return NextResponse.json(result.news || [])
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in stock API:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
