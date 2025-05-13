"use client"
import Image from "next/image"
import { motion } from "framer-motion"

const StockChart = ({ imgSrc, ticker }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-100"
    >
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={`${ticker} Stock Price Prediction Chart`}
        className="rounded-lg object-contain"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
        {ticker} Prediction Chart
      </div>
    </motion.div>
  )
}

export default StockChart
