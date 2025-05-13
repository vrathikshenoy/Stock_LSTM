"use client";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LineChartIcon } from "lucide-react";

const HistoricalPerformance = ({ data, currencySymbol = "$" }) => {
  const chartData = data.dates.map((date, index) => ({
    date,
    actual: data.actual[index],
    predicted: data.predicted[index],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 h-full"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <LineChartIcon className="mr-2 text-purple-600" /> Prediction
        Performance
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              stroke="#d1d5db"
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              stroke="#d1d5db"
              tickFormatter={(value) => `${currencySymbol}${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value) => [
                `${currencySymbol}${value.toFixed(2)}`,
                "",
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="circle" />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Actual Price"
              activeDot={{
                r: 8,
                fill: "#8b5cf6",
                stroke: "white",
                strokeWidth: 2,
              }}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#ef4444"
              strokeWidth={3}
              name="Predicted Price"
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Accuracy</p>
          <p className="font-semibold text-purple-700">
            {(
              100 -
              (Math.abs(
                data.actual[data.actual.length - 1] -
                  data.predicted[data.predicted.length - 1],
              ) /
                data.actual[data.actual.length - 1]) *
                100
            ).toFixed(1)}
            %
          </p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Average Error</p>
          <p className="font-semibold text-red-700">
            {currencySymbol}
            {(
              data.actual.reduce(
                (acc, val, i) => acc + Math.abs(val - data.predicted[i]),
                0,
              ) / data.actual.length
            ).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoricalPerformance;
