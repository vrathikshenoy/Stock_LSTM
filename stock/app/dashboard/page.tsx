"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  BarChart2,
  TrendingUp,
  AlertCircle,
  Bell,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StockChart from "@/components/StockChart";
import PredictionCard from "@/components/PredictionCard";
import HistoricalPerformance from "@/components/HistoricalPerformance";
import TrainingMetrics from "@/components/TrainingMetrics";
import MainStats from "@/components/MainStats";
import LoadingSpinner from "@/components/LoadingSpinner";
import { StockHints } from "@/components/StockHints";
import { getCurrencySymbol } from "@/components/getCurrencySymbol";

export default function Dashboard() {
  const [ticker, setTicker] = useState("AAPL");
  const [inputTicker, setInputTicker] = useState("AAPL");
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol(ticker));
  }, [ticker]);

  const fetchPrediction = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker: symbol }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch prediction data");
      }

      const data = await response.json();
      setPredictionData(data);
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(ticker);
  }, [ticker]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setTicker(inputTicker.toUpperCase());
    }
  };

  const handleSelectStock = (selectedTicker) => {
    setInputTicker(selectedTicker);
    setTicker(selectedTicker);
  };

  const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

  if (loading && !predictionData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  StockPredict
                </span>
              </Link>

              <nav className="hidden md:flex ml-10 space-x-8">
                <Link href="/dashboard" className="text-purple-600 font-medium">
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 font-medium"
                >
                  Watchlist
                </Link>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 font-medium"
                >
                  Portfolio
                </Link>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 font-medium"
                >
                  News
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Help</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                className="md:hidden p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 bg-purple-50"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Watchlist
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Portfolio
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              News
            </Link>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Stock Prediction Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Make data-driven investment decisions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full">
                <Input
                  type="text"
                  value={inputTicker}
                  onChange={(e) => setInputTicker(e.target.value)}
                  placeholder="Enter stock ticker..."
                  className="pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-0 top-0 h-full rounded-l-none bg-purple-600 hover:bg-purple-700"
                >
                  <Search size={18} />
                </Button>
              </div>
            </form>
            <StockHints onSelectStock={handleSelectStock} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700">Popular:</span>
          {popularStocks.map((stock) => (
            <button
              key={stock}
              onClick={() => {
                setInputTicker(stock);
                setTicker(stock);
              }}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                ticker === stock
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {stock}
            </button>
          ))}
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

        {predictionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <MainStats
                ticker={predictionData.ticker}
                data={predictionData}
                currencySymbol={currencySymbol}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BarChart2 className="mr-2 text-purple-600" /> Price
                  Prediction Chart
                </h2>
                <StockChart
                  imgSrc={`data:image/png;base64,${predictionData.plot}`}
                  ticker={predictionData.ticker}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-1"
              >
                <PredictionCard
                  futurePredictions={predictionData.future_predictions}
                  ticker={predictionData.ticker}
                  latestPrice={predictionData.latest_price}
                  currencySymbol={currencySymbol}
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <HistoricalPerformance
                  data={predictionData.prediction_performance}
                  currencySymbol={currencySymbol}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <TrainingMetrics
                  lossHistory={predictionData.loss_history}
                  rmse={predictionData.rmse}
                  currencySymbol={currencySymbol}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} StockPredict. All rights
              reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
