"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, BarChart2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StockChart from "@/components/StockChart"
import PredictionCard from "@/components/PredictionCard"
import HistoricalPerformance from "@/components/HistoricalPerformance"
import TrainingMetrics from "@/components/TrainingMetrics"
import MainStats from "@/components/MainStats"
import LoadingSpinner from "@/components/LoadingSpinner"
import { StockHints } from "@/components/StockHints"
import { getCurrencySymbol } from "@/utils/getCurrencySymbol"
import AppLayout from "@/components/AppLayout"

export default function Dashboard() {
  const [ticker, setTicker] = useState("AAPL")
  const [inputTicker, setInputTicker] = useState("AAPL")
  const [predictionData, setPredictionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currencySymbol, setCurrencySymbol] = useState("$")

  useEffect(() => {
    setCurrencySymbol(getCurrencySymbol(ticker))
  }, [ticker])

  const fetchPrediction = async (symbol) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker: symbol }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch prediction data")
      }

      const data = await response.json()
      setPredictionData(data)
    } catch (err) {
      console.error("Error fetching prediction:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrediction(ticker)
  }, [ticker])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputTicker.trim()) {
      setTicker(inputTicker.toUpperCase())
    }
  }

  const handleSelectStock = (selectedTicker) => {
    setInputTicker(selectedTicker)
    setTicker(selectedTicker)
  }

  const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]

  if (loading && !predictionData) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Stock Prediction Dashboard</h1>
          <p className="text-gray-600 mt-1">Make data-driven investment decisions</p>
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
              setInputTicker(stock)
              setTicker(stock)
            }}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              ticker === stock ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="mb-6">
            <MainStats ticker={predictionData.ticker} data={predictionData} currencySymbol={currencySymbol} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart2 className="mr-2 text-purple-600" /> Price Prediction Chart
              </h2>
              <StockChart imgSrc={`data:image/png;base64,${predictionData.plot}`} ticker={predictionData.ticker} />
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <HistoricalPerformance data={predictionData.prediction_performance} currencySymbol={currencySymbol} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <TrainingMetrics
                lossHistory={predictionData.loss_history}
                rmse={predictionData.rmse}
                currencySymbol={currencySymbol}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AppLayout>
  )
}
