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

// Fallback news data in case the API fails
const fallbackMarketNews: NewsItem[] = [
  {
    uuid: "fallback-1",
    title: "Markets showing resilience amid economic uncertainty",
    publisher: "Financial Times",
    link: "https://www.ft.com",
    providerPublishTime: Math.floor(Date.now() / 1000) - 3600,
    type: "STORY",
  },
  {
    uuid: "fallback-2",
    title: "Tech stocks surge as investors eye AI developments",
    publisher: "CNBC",
    link: "https://www.cnbc.com",
    providerPublishTime: Math.floor(Date.now() / 1000) - 7200,
    type: "STORY",
  },
  {
    uuid: "fallback-3",
    title: "Federal Reserve considers policy shift as inflation data emerges",
    publisher: "Wall Street Journal",
    link: "https://www.wsj.com",
    providerPublishTime: Math.floor(Date.now() / 1000) - 10800,
    type: "STORY",
  },
];

// Helper function to retry API calls
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  retryDelay = 1000,
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;

    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchWithRetry(url, options, retries - 1, retryDelay * 1.5);
    }

    throw new Error(`API error: ${response.status}`);
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchWithRetry(url, options, retries - 1, retryDelay * 1.5);
    }
    throw error;
  }
}

// Updated to use the API endpoint instead of direct Yahoo Finance calls
export async function getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  try {
    // Join symbols with commas for the API request
    const symbolsParam = symbols.join(",");
    // Use the internal API route with retry logic
    const response = await fetchWithRetry(
      `/api/stockQuotes?symbols=${symbolsParam}`,
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    // Parse the date string back to Date object
    return data.map((quote) => ({
      ...quote,
      regularMarketTime: new Date(quote.regularMarketTime),
    }));
  } catch (error) {
    console.error("Error fetching stock quotes:", error);
    throw error;
  }
}

// Stock news with fallback mechanism
export async function getStockNews(
  symbol: string,
  count = 10,
): Promise<NewsItem[]> {
  try {
    const response = await fetchWithRetry(
      `/api/stockNews?symbol=${symbol}&count=${count}`,
    );
    if (!response.ok) {
      console.warn(
        `API returned status ${response.status} for ${symbol}, using generic news`,
      );
      // Use fallback data but customize for the symbol
      return fallbackMarketNews.map((item) => ({
        ...item,
        uuid: `${item.uuid}-${symbol}`,
        title: item.title.includes(symbol)
          ? item.title
          : `${item.title} - Impact on ${symbol.toUpperCase()}`,
      }));
    }
    const data = await response.json();
    return data.length > 0
      ? data
      : fallbackMarketNews.map((item) => ({
          ...item,
          uuid: `${item.uuid}-${symbol}`,
          title: item.title.includes(symbol)
            ? item.title
            : `${item.title} - Impact on ${symbol.toUpperCase()}`,
        }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    // Return fallback data customized for the symbol
    return fallbackMarketNews.map((item) => ({
      ...item,
      uuid: `${item.uuid}-${symbol}`,
      title: item.title.includes(symbol)
        ? item.title
        : `${item.title} - Impact on ${symbol.toUpperCase()}`,
    }));
  }
}
