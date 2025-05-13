import React from "react";
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
import { LineChart as LineChartIcon } from "lucide-react";

const HistoricalPerformance = ({ data }) => {
  // Combine actual and predicted data for the chart
  const chartData = data.dates.map((date, index) => ({
    date,
    actual: data.actual[index],
    predicted: data.predicted[index],
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <LineChartIcon className="mr-2" /> Prediction Performance
      </h2>

      <div className="h-64">
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [`$${value.toFixed(2)}`, ""]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Actual Price"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#ef4444"
              strokeWidth={2}
              name="Predicted Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalPerformance;
