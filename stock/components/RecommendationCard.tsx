"use client"

import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, TrendingUp, AlertTriangle, Clock } from "lucide-react"
import type { StockRecommendation } from "@/app/actions/getRecommendations"
import { getCurrencySymbol } from "@/utils/getCurrencySymbol"

interface RecommendationCardProps {
  recommendation: StockRecommendation
  index: number
}

export default function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const {
    symbol,
    name,
    recommendation: recommendationType,
    currentPrice,
    targetPrice,
    potentialGrowth,
    rationale,
    riskLevel,
    sector,
    timeHorizon,
  } = recommendation

  const currencySymbol = getCurrencySymbol(symbol)
  const isPositive = potentialGrowth > 0
  const isIndianStock = symbol.endsWith(".NS") || symbol.endsWith(".BO")

  // Determine recommendation color
  const getRecommendationColor = () => {
    switch (recommendationType) {
      case "Strong Buy":
        return "bg-green-100 text-green-800"
      case "Buy":
        return "bg-emerald-100 text-emerald-800"
      case "Hold":
        return "bg-blue-100 text-blue-800"
      case "Sell":
        return "bg-orange-100 text-orange-800"
      case "Strong Sell":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Determine risk level color
  const getRiskLevelColor = () => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-50 text-green-700 border-green-200"
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "High":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{symbol}</h3>
            <p className="text-gray-600">{name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor()}`}>
            {recommendationType}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Price</p>
            <p className="text-lg font-semibold">
              {currencySymbol}
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Target Price</p>
            <p className="text-lg font-semibold">
              {currencySymbol}
              {targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Potential Growth</p>
          <div className={`flex items-center text-lg font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <ArrowUp className="h-5 w-5 mr-1" /> : <ArrowDown className="h-5 w-5 mr-1" />}
            {Math.abs(potentialGrowth).toFixed(2)}%
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Rationale</p>
          <p className="text-gray-700">{rationale}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor()}`}>
            <div className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {riskLevel} Risk
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {sector}
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {timeHorizon}
            </div>
          </div>
          {isIndianStock && (
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              Indian Stock
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
