"use client";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp } from "lucide-react";

const MainStats = ({ ticker, data, currencySymbol = "$" }) => {
  const isPositive = data.percent_change > 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 w-full"
    >
      {/* Main Stock Info Card */}
      <motion.div
        variants={item}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Stock Price Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold">{ticker}</h2>
              <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-md">
                {data.market_summary.date}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">
                {currencySymbol}
                {data.latest_price.toFixed(2)}
              </span>
              <div
                className={`flex items-center text-lg font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {isPositive ? (
                  <span className="flex items-center">
                    <ArrowUp className="h-5 w-5 mr-1" />
                    {data.percent_change.toFixed(2)}%
                  </span>
                ) : (
                  <span className="flex items-center">
                    <ArrowDown className="h-5 w-5 mr-1" />
                    {Math.abs(data.percent_change).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Market Summary Section */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
            <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-600" /> Market
              Summary
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-lg font-semibold">
                  {currencySymbol}
                  {data.market_summary.open.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">High</p>
                <p className="text-lg font-semibold">
                  {currencySymbol}
                  {data.market_summary.high.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Low</p>
                <p className="text-lg font-semibold">
                  {currencySymbol}
                  {data.market_summary.low.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Volume</p>
                <p className="text-lg font-semibold">
                  {(data.market_summary.volume / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          </div>

          {/* Prediction Info Section */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
            <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" /> Prediction
              Info
            </h3>
            <div className="grid grid-cols-1 gap-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Short-term (10 days)</p>
                <p
                  className={`text-lg font-semibold ${
                    data.future_predictions.values["10"][9] > data.latest_price
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {currencySymbol}
                  {data.future_predictions.values["10"][9].toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Mid-term (20 days)</p>
                <p
                  className={`text-lg font-semibold ${
                    data.future_predictions.values["20"][19] > data.latest_price
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {currencySymbol}
                  {data.future_predictions.values["20"][19].toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Long-term (50 days)</p>
                <p
                  className={`text-lg font-semibold ${
                    data.future_predictions.values["50"][49] > data.latest_price
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {currencySymbol}
                  {data.future_predictions.values["50"][49].toFixed(2)}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-gray-500">Model Accuracy</p>
                  <span className="font-semibold">
                    {Math.max(
                      0,
                      100 - (data.rmse / data.latest_price) * 100,
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      Math.max(0, 100 - (data.rmse / data.latest_price) * 100) >
                      80
                        ? "bg-green-500"
                        : Math.max(
                              0,
                              100 - (data.rmse / data.latest_price) * 100,
                            ) > 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.max(0, 100 - (data.rmse / data.latest_price) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MainStats;
