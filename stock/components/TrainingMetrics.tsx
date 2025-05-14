"use client"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ActivitySquare, AlertCircle } from "lucide-react"

const TrainingMetrics = ({ lossHistory, rmse, currencySymbol = "$" }) => {
  // Prepare data for loss history chart
  const chartData = lossHistory.map((loss, index) => ({
    epoch: (index + 1) * 10, // Assuming we're getting every 10th epoch
    loss,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 h-full"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <ActivitySquare className="mr-2 text-purple-600" /> Training Metrics
      </h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600">Root Mean Square Error (RMSE)</p>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 text-purple-600" />
            <span className="font-medium text-purple-700">
              {currencySymbol}
              {rmse.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${rmse < 5 ? "bg-green-500" : rmse < 10 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(100, (1 - rmse / 50) * 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Lower is better</p>
      </div>

      <h3 className="font-medium text-gray-700 mb-3">Loss History</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="epoch"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{ value: "Epoch", position: "insideBottom", offset: -5, fill: "#6b7280" }}
              stroke="#d1d5db"
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{ value: "Loss", angle: -90, position: "insideLeft", fill: "#6b7280" }}
              stroke="#d1d5db"
            />
            <Tooltip
              formatter={(value) => [value.toFixed(4), "Loss"]}
              labelFormatter={(label) => `Epoch ${label}`}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            />
            <Line
              type="monotone"
              dataKey="loss"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#8b5cf6", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Initial Loss</p>
          <p className="font-semibold text-purple-700">{lossHistory[0].toFixed(4)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Final Loss</p>
          <p className="font-semibold text-green-700">{lossHistory[lossHistory.length - 1].toFixed(4)}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default TrainingMetrics
