import React from "react";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  BarChart2,
  TrendingUp,
} from "lucide-react";

const MainStats = ({ ticker, data }) => {
  const isPositive = data.percent_change > 0;

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <div className="flex items-baseline mb-2">
          <h2 className="text-2xl font-bold">{ticker}</h2>
          <span className="text-gray-500 ml-2">{data.market_summary.date}</span>
        </div>

        <div className="flex items-baseline">
          <span className="text-3xl font-bold">
            ${data.latest_price.toFixed(2)}
          </span>
          <div
            className={`ml-2 flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? (
              <span className="flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                {data.percent_change.toFixed(2)}%
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDown className="h-4 w-4 mr-1" />
                {Math.abs(data.percent_change).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-1" /> Market Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Open</p>
            <p className="font-semibold">
              ${data.market_summary.open.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">High</p>
            <p className="font-semibold">
              ${data.market_summary.high.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Low</p>
            <p className="font-semibold">
              ${data.market_summary.low.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Volume</p>
            <p className="font-semibold">
              {(data.market_summary.volume / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" /> Prediction Info
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Short-term (10 days)</p>
            <p
              className={`font-semibold ${data.future_predictions.values["10"][9] > data.latest_price ? "text-green-600" : "text-red-600"}`}
            >
              ${data.future_predictions.values["10"][9].toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Mid-term (20 days)</p>
            <p
              className={`font-semibold ${data.future_predictions.values["20"][19] > data.latest_price ? "text-green-600" : "text-red-600"}`}
            >
              ${data.future_predictions.values["20"][19].toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Long-term (50 days)</p>
            <p
              className={`font-semibold ${data.future_predictions.values["50"][49] > data.latest_price ? "text-green-600" : "text-red-600"}`}
            >
              ${data.future_predictions.values["50"][49].toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Model Accuracy</p>
            <p className="font-semibold">
              {Math.max(0, 100 - (data.rmse / data.latest_price) * 100).toFixed(
                1,
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainStats;
