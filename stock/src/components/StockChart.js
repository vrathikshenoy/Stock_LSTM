import React from "react";
import Image from "next/image";

const StockChart = ({ imgSrc, ticker }) => {
  return (
    <div className="relative w-full h-96">
      <Image
        src={imgSrc}
        alt={`${ticker} Stock Price Prediction Chart`}
        className="rounded-lg object-contain"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
};

export default StockChart;
