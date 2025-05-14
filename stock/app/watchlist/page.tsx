"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  RefreshCw,
  Star,
  StarOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockHints } from "@/components/StockHints";
import AppLayout from "@/components/AppLayout";
import { getStockQuotes, type StockQuote } from "@/services/yahooFinance";
import { getCurrencySymbol } from "@/utils/getCurrencySymbol";

// Default watchlist stocks
const DEFAULT_WATCHLIST = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "JPM",
  "V",
  "RELIANCE.NS",
];

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [stockData, setStockData] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newStock, setNewStock] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize watchlist from localStorage or use default
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    } else {
      setWatchlist(DEFAULT_WATCHLIST);
    }
  }, []);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist]);

  // Fetch stock data
  const fetchStockData = async () => {
    if (watchlist.length === 0) return;

    setRefreshing(true);
    try {
      const quotes = await getStockQuotes(watchlist);
      setStockData(quotes);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error("Error fetching stock data:", err);
      setError("Failed to fetch stock data. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and setup interval
  useEffect(() => {
    if (watchlist.length > 0) {
      fetchStockData();

      // Set up interval to refresh data every 60 seconds (increased from 15 to reduce API calls)
      const intervalId = setInterval(fetchStockData, 60000);

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [watchlist]);

  // Add stock to watchlist
  const addStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStock && !watchlist.includes(newStock.toUpperCase())) {
      setWatchlist([...watchlist, newStock.toUpperCase()]);
      setNewStock("");
    }
  };

  // Remove stock from watchlist
  const removeStock = (symbol: string) => {
    setWatchlist(watchlist.filter((stock) => stock !== symbol));
  };

  // Handle stock selection from hints
  const handleSelectStock = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  // Reset to default watchlist
  const resetWatchlist = () => {
    setWatchlist(DEFAULT_WATCHLIST);
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Watchlist
          </h1>
          <p className="text-gray-600 mt-1">
            Track your favorite stocks in real-time
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={addStock} className="flex w-full">
            <div className="relative w-full">
              <Input
                type="text"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Add stock ticker..."
                className="pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-0 top-0 h-full rounded-l-none bg-purple-600 hover:bg-purple-700"
              >
                <Plus size={18} />
              </Button>
            </div>
          </form>
          <StockHints onSelectStock={handleSelectStock} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={fetchStockData}
            disabled={refreshing || loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={resetWatchlist}
          >
            <Star className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()} ({watchlist.length}{" "}
            stocks)
          </p>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md flex items-center"
        >
          <AlertCircle className="mr-2" />
          <p>{error}</p>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day Range
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {stockData.map((stock) => {
                      const isPositive = stock.regularMarketChange >= 0;
                      const currencySymbol = getCurrencySymbol(stock.symbol);

                      return (
                        <motion.tr
                          key={stock.symbol}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {stock.symbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {stock.shortName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {currencySymbol}
                              {stock.regularMarketPrice.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div
                              className={`text-sm font-medium flex items-center justify-end ${
                                isPositive ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUp className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDown className="h-4 w-4 mr-1" />
                              )}
                              {currencySymbol}
                              {Math.abs(stock.regularMarketChange).toFixed(2)} (
                              {Math.abs(
                                stock.regularMarketChangePercent,
                              ).toFixed(2)}
                              %)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm text-gray-900">
                              {currencySymbol}
                              {stock.regularMarketDayLow.toFixed(2)} -{" "}
                              {currencySymbol}
                              {stock.regularMarketDayHigh.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm text-gray-900">
                              {(stock.regularMarketVolume / 1000000).toFixed(2)}
                              M
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => removeStock(stock.symbol)}
                              className="text-red-600 hover:text-red-900"
                              title="Remove from watchlist"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {watchlist.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <StarOff className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your watchlist is empty
          </h3>
          <p className="text-gray-600 mb-4 text-center">
            Add stocks to your watchlist to track their performance in
            real-time.
          </p>
          <Button
            onClick={resetWatchlist}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Add Default Stocks
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
