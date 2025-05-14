"use client"
import { useState } from "react"
import { HelpCircle, Search, Globe, Flag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// List of top international stocks
const internationalStocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "BRK.A", name: "Berkshire Hathaway Inc." },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "PG", name: "Procter & Gamble Co." },
  { symbol: "UNH", name: "UnitedHealth Group Inc." },
  { symbol: "HD", name: "Home Depot Inc." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "BAC", name: "Bank of America Corp." },
  { symbol: "DIS", name: "Walt Disney Co." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CRM", name: "Salesforce Inc." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "CMCSA", name: "Comcast Corporation" },
  { symbol: "PFE", name: "Pfizer Inc." },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "VZ", name: "Verizon Communications Inc." },
]

// List of top Indian stocks
const indianStocks = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd." },
  { symbol: "TCS.NS", name: "Tata Consultancy Services Ltd." },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd." },
  { symbol: "INFY.NS", name: "Infosys Ltd." },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd." },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd." },
  { symbol: "SBIN.NS", name: "State Bank of India" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd." },
  { symbol: "ITC.NS", name: "ITC Ltd." },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Ltd." },
  { symbol: "HCLTECH.NS", name: "HCL Technologies Ltd." },
  { symbol: "WIPRO.NS", name: "Wipro Ltd." },
  { symbol: "AXISBANK.NS", name: "Axis Bank Ltd." },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints Ltd." },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki India Ltd." },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors Ltd." },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical Industries Ltd." },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance Ltd." },
  { symbol: "TATASTEEL.NS", name: "Tata Steel Ltd." },
  { symbol: "ADANIPORTS.NS", name: "Adani Ports and Special Economic Zone Ltd." },
  { symbol: "TITAN.BO", name: "Titan Company Ltd." },
  { symbol: "BAJAJFINSV.BO", name: "Bajaj Finserv Ltd." },
  { symbol: "NTPC.BO", name: "NTPC Ltd." },
  { symbol: "POWERGRID.BO", name: "Power Grid Corporation of India Ltd." },
  { symbol: "ONGC.BO", name: "Oil and Natural Gas Corporation Ltd." },
]

interface StockHintsProps {
  onSelectStock: (ticker: string) => void
}

export function StockHints({ onSelectStock }: StockHintsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  const filterStocks = (stocks: typeof internationalStocks) => {
    if (!searchQuery) return stocks
    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const handleSelectStock = (ticker: string) => {
    onSelectStock(ticker)
    setOpen(false)
    setSearchQuery("")
  }

  const filteredInternationalStocks = filterStocks(internationalStocks)
  const filteredIndianStocks = filterStocks(indianStocks)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Stock Hints</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Popular Stock Tickers</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search stocks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="international" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="international" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              International
            </TabsTrigger>
            <TabsTrigger value="indian" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Indian
            </TabsTrigger>
          </TabsList>

          <TabsContent value="international" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredInternationalStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 text-left transition-colors"
                    onClick={() => handleSelectStock(stock.symbol)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.symbol}</span>
                      <span className="text-sm text-gray-500 truncate">{stock.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      USD
                    </Badge>
                  </button>
                ))}
                {filteredInternationalStocks.length === 0 && (
                  <p className="text-gray-500 col-span-2 text-center py-8">No stocks found matching your search.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="indian" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredIndianStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 text-left transition-colors"
                    onClick={() => handleSelectStock(stock.symbol)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.symbol}</span>
                      <span className="text-sm text-gray-500 truncate">{stock.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      INR
                    </Badge>
                  </button>
                ))}
                {filteredIndianStocks.length === 0 && (
                  <p className="text-gray-500 col-span-2 text-center py-8">No stocks found matching your search.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            <span className="font-medium">Tip:</span> Indian stocks end with .NS (NSE) or .BO (BSE) and will display
            prices in ₹
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
