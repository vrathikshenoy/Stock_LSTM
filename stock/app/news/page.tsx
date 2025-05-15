"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  ExternalLink,
  AlertCircle,
  Newspaper,
  RefreshCw,
  Globe,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";
import {
  getMarketNews,
  getStockNews,
  type NewsItem,
} from "@/app/actions/geminiNewsService";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch market news based on region
  const fetchMarketNews = async (market = "global") => {
    setLoading(true);
    setError(null);
    try {
      const newsData = await getMarketNews(market, 20);
      setNews(newsData);
    } catch (err) {
      console.error(`Error fetching ${market} market news:`, err);
      setError(
        `Unable to fetch the latest ${market} market news. Showing available updates.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch stock-specific news
  const fetchStockNews = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const newsData = await getStockNews(symbol, 20);
      setNews(newsData);
    } catch (err) {
      console.error(`Error fetching news for ${symbol}:`, err);
      setError(
        `Unable to fetch the latest news for ${symbol}. Showing available updates.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMarketNews();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab("search");
      fetchStockNews(searchQuery.trim());
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "global" || value === "india") {
      fetchMarketNews(value);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (activeTab === "global" || activeTab === "india") {
      fetchMarketNews(activeTab).finally(() => setIsRefreshing(false));
    } else if (searchQuery.trim()) {
      fetchStockNews(searchQuery.trim()).finally(() => setIsRefreshing(false));
    } else {
      setIsRefreshing(false);
    }
  };

  // Format publish time
  const formatPublishTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Get thumbnail URL
  const getThumbnailUrl = (newsItem: NewsItem) => {
    if (
      newsItem.thumbnail &&
      newsItem.thumbnail.resolutions &&
      newsItem.thumbnail.resolutions.length > 0
    ) {
      // Find a medium-sized image if available
      const mediumImage = newsItem.thumbnail.resolutions.find(
        (res) => res.width >= 300 && res.width <= 500,
      );
      if (mediumImage) return mediumImage.url;

      // Otherwise use the first one
      return newsItem.thumbnail.resolutions[0].url;
    }
    // Default placeholder
    return "/placeholder.svg?height=200&width=300";
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Financial News
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered market insights from around the world
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <form onSubmit={handleSearch} className="flex w-full md:w-64">
            <div className="relative w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news by ticker..."
                className="pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-0 top-0 h-full rounded-l-none bg-purple-600 hover:bg-purple-700"
              >
                <Search size={18} />
              </Button>
            </div>
          </form>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            disabled={isRefreshing}
            className="flex-shrink-0"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="global"
        value={activeTab}
        onValueChange={handleTabChange}
        className="mb-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="global" className="flex items-center gap-1">
            <Globe size={16} /> Global
          </TabsTrigger>
          <TabsTrigger value="india" className="flex items-center gap-1">
            <MapPin size={16} /> India
          </TabsTrigger>
          <TabsTrigger value="search" disabled={!searchQuery.trim()}>
            {searchQuery.trim() ? `${searchQuery.toUpperCase()}` : "Stock News"}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded shadow-md flex items-center"
        >
          <AlertCircle className="mr-2" />
          <p>{error}</p>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <motion.div
              key={item.uuid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="h-48 relative">
                <img
                  src={getThumbnailUrl(item) || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=200&width=300";
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {item.content && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.content}
                  </p>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatPublishTime(item.providerPublishTime)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-600">
                    {item.publisher}
                  </span>
                  {item.link && item.link !== "#" ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      Read More <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">AI Generated</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Newspaper className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No news found
          </h3>
          <p className="text-gray-600 text-center">
            {activeTab === "global" || activeTab === "india"
              ? `There are no ${activeTab} market news available at the moment.`
              : `No news found for ${searchQuery.toUpperCase()}. Try another ticker.`}
          </p>
        </div>
      )}
    </AppLayout>
  );
}
