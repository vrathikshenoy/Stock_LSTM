"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Search,
  BarChart2,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";
import StockChart from "@/components/StockChart";
import PredictionCard from "@/components/PredictionCard";
import HistoricalPerformance from "@/components/HistoricalPerformance";
import TrainingMetrics from "@/components/TrainingMetrics";
import MainStats from "@/components/MainStats";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const [ticker, setTicker] = useState("AAPL");
  const [inputTicker, setInputTicker] = useState("AAPL");
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setTicker(inputTicker.toUpperCase());
  };

  if (loading && !predictionData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Stock Price Prediction Dashboard
          </h1>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={inputTicker}
                onChange={(e) => setInputTicker(e.target.value)}
                placeholder="Enter stock ticker..."
                className="w-full px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        )}

        {predictionData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <MainStats ticker={predictionData.ticker} data={predictionData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BarChart2 className="mr-2" /> Price Prediction Chart
                </h2>
                <StockChart
                  imgSrc={`data:image/png;base64,${predictionData.plot}`}
                  ticker={predictionData.ticker}
                />
              </div>

              <div className="lg:col-span-1">
                <PredictionCard
                  futurePredictions={predictionData.future_predictions}
                  ticker={predictionData.ticker}
                  latestPrice={predictionData.latest_price}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <HistoricalPerformance
                data={predictionData.prediction_performance}
              />
              <TrainingMetrics
                lossHistory={predictionData.loss_history}
                rmse={predictionData.rmse}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
