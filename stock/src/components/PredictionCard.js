import React from "react";
import { TrendingUp, Calendar } from "lucide-react";

const PredictionCard = ({ futurePredictions, ticker, latestPrice }) => {
  // Get time periods (10, 20, 50 days)
  const periods = Object.keys(futurePredictions.dates);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <TrendingUp className="mr-2" /> Future Price Predictions
      </h2>

      <div className="space-y-6">
        {periods.map((period) => {
          const lastIndex = futurePredictions.values[period].length - 1;
          const finalValue = futurePredictions.values[period][lastIndex];
          const percentChange = (finalValue / latestPrice - 1) * 100;
          const isPositive = percentChange > 0;

          return (
            <div key={period} className="border-b pb-4 last:border-b-0">
              <h3 className="font-medium text-gray-700 flex items-center mb-2">
                <Calendar className="mr-2 h-4 w-4" /> {period} Day Forecast
              </h3>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">${finalValue.toFixed(2)}</p>
                  <div
                    className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}
                  >
                    {isPositive ? (
                      <span className="flex items-center">
                        ↑ {percentChange.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="flex items-center">
                        ↓ {Math.abs(percentChange).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Forecast End Date</p>
                  <p className="font-medium">
                    {
                      futurePredictions.dates[period][
                        futurePredictions.dates[period].length - 1
                      ]
                    }
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionCard;
