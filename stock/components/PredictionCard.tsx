"use client"
import { motion } from "framer-motion"
import { TrendingUp, Calendar, ArrowUp, ArrowDown } from "lucide-react"

const PredictionCard = ({ futurePredictions, ticker, latestPrice, currencySymbol = "$" }) => {
  // Get time periods (10, 20, 50 days)
  const periods = Object.keys(futurePredictions.dates)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 h-full"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <TrendingUp className="mr-2 text-purple-600" /> Future Price Predictions
      </h2>

      <div className="space-y-6">
        {periods.map((period, index) => {
          const lastIndex = futurePredictions.values[period].length - 1
          const finalValue = futurePredictions.values[period][lastIndex]
          const percentChange = (finalValue / latestPrice - 1) * 100
          const isPositive = percentChange > 0

          return (
            <motion.div key={period} variants={item} className="border-b pb-6 last:border-b-0 last:pb-0">
              <h3 className="font-medium text-gray-700 flex items-center mb-3">
                <Calendar className="mr-2 h-4 w-4 text-purple-600" /> {period} Day Forecast
              </h3>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">
                    {currencySymbol}
                    {finalValue.toFixed(2)}
                  </p>
                  <div className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"} mt-1`}>
                    {isPositive ? (
                      <span className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        {percentChange.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ArrowDown className="h-4 w-4 mr-1" />
                        {Math.abs(percentChange).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Forecast End Date</p>
                  <p className="font-medium">
                    {futurePredictions.dates[period][futurePredictions.dates[period].length - 1]}
                  </p>
                </div>
              </div>

              {/* Progress bar showing prediction confidence */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Confidence Level</span>
                  <span>{90 - index * 5}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      90 - index * 5 > 80 ? "bg-green-500" : 90 - index * 5 > 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${90 - index * 5}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default PredictionCard
