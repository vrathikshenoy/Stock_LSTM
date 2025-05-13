import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ActivitySquare, AlertCircle } from "lucide-react";

const TrainingMetrics = ({ lossHistory, rmse }) => {
  // Prepare data for loss history chart
  const chartData = lossHistory.map((loss, index) => ({
    epoch: (index + 1) * 10, // Assuming we're getting every 10th epoch
    loss,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <ActivitySquare className="mr-2" /> Training Metrics
      </h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600">Root Mean Square Error (RMSE)</p>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 text-blue-500" />
            <span className="font-medium text-blue-600">
              ${rmse.toFixed(2)}
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
      <div className="h-48">
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="epoch"
              tick={{ fontSize: 12 }}
              label={{ value: "Epoch", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: "Loss", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value) => [value.toFixed(4), "Loss"]}
              labelFormatter={(label) => `Epoch ${label}`}
            />
            <Line
              type="monotone"
              dataKey="loss"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrainingMetrics;
