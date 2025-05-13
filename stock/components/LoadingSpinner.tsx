"use client"
import { motion } from "framer-motion"

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
        <motion.div
          className="absolute top-0 left-0 w-20 h-20 border-4 border-t-purple-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        ></motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 text-gray-700 text-lg font-medium"
      >
        Loading prediction data...
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-gray-500 text-sm mt-2"
      >
        This may take a few moments
      </motion.p>
    </div>
  )
}

export default LoadingSpinner
