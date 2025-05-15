"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertCircle, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/AppLayout";
import RecommendationCard from "@/components/RecommendationCard";
import {
  getStockRecommendations,
  type StockRecommendation,
} from "@/app/actions/getRecommendations";

export default function RecommendationPage() {
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    recommendationTypes: [] as string[],
    riskLevels: [] as string[],
    timeHorizons: [] as string[],
    showIndianStocks: true,
    showUSStocks: true,
  });

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStockRecommendations();
      setRecommendations(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(
        "Failed to fetch stock recommendations. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Filter recommendations based on selected filters
  const filteredRecommendations = recommendations.filter((rec) => {
    // Filter by recommendation type
    if (
      filters.recommendationTypes.length > 0 &&
      !filters.recommendationTypes.includes(rec.recommendation)
    ) {
      return false;
    }

    // Filter by risk level
    if (
      filters.riskLevels.length > 0 &&
      !filters.riskLevels.includes(rec.riskLevel)
    ) {
      return false;
    }

    // Filter by time horizon
    if (
      filters.timeHorizons.length > 0 &&
      !filters.timeHorizons.includes(rec.timeHorizon)
    ) {
      return false;
    }

    // Filter by stock market (Indian vs US)
    const isIndianStock =
      rec.symbol.endsWith(".NS") || rec.symbol.endsWith(".BO");
    if (isIndianStock && !filters.showIndianStocks) {
      return false;
    }
    if (!isIndianStock && !filters.showUSStocks) {
      return false;
    }

    return true;
  });

  // Toggle filter selection
  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      if (category === "showIndianStocks" || category === "showUSStocks") {
        return {
          ...prev,
          [category]: !prev[category],
        };
      }

      const currentFilters = prev[category] as string[];
      return {
        ...prev,
        [category]: currentFilters.includes(value)
          ? currentFilters.filter((item) => item !== value)
          : [...currentFilters, value],
      };
    });
  };

  // Get all unique values for filters
  const getUniqueFilterValues = (key: keyof StockRecommendation) => {
    return [...new Set(recommendations.map((rec) => rec[key]))];
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Stock Recommendations
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered stock recommendations based on market analysis
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={fetchRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Recommendation Type</DropdownMenuLabel>
              {getUniqueFilterValues("recommendation").map((type) => (
                <DropdownMenuCheckboxItem
                  key={`rec-${type}`}
                  checked={filters.recommendationTypes.includes(type as string)}
                  onCheckedChange={() =>
                    toggleFilter("recommendationTypes", type as string)
                  }
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Risk Level</DropdownMenuLabel>
              {getUniqueFilterValues("riskLevel").map((level) => (
                <DropdownMenuCheckboxItem
                  key={`risk-${level}`}
                  checked={filters.riskLevels.includes(level as string)}
                  onCheckedChange={() =>
                    toggleFilter("riskLevels", level as string)
                  }
                >
                  {level}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Time Horizon</DropdownMenuLabel>
              {getUniqueFilterValues("timeHorizon").map((horizon) => (
                <DropdownMenuCheckboxItem
                  key={`time-${horizon}`}
                  checked={filters.timeHorizons.includes(horizon as string)}
                  onCheckedChange={() =>
                    toggleFilter("timeHorizons", horizon as string)
                  }
                >
                  {horizon}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Market</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.showUSStocks}
                onCheckedChange={() => toggleFilter("showUSStocks", "")}
              >
                US Stocks
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showIndianStocks}
                onCheckedChange={() => toggleFilter("showIndianStocks", "")}
              >
                Indian Stocks
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {lastUpdated.toLocaleDateString()} at{" "}
          {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md flex items-center"
        >
          <AlertCircle className="mr-2" />
          <p>{error}</p>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-600">
            Generating AI-powered stock recommendations...
          </p>
        </div>
      ) : filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.symbol}
              recommendation={recommendation}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recommendations found
          </h3>
          <p className="text-gray-600 text-center">
            {recommendations.length > 0
              ? "No recommendations match your current filters. Try adjusting your filters."
              : "Unable to generate recommendations at this time. Please try again later."}
          </p>
        </div>
      )}
    </AppLayout>
  );
}
