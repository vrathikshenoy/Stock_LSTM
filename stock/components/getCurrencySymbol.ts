// utils/getCurrencySymbol.ts

export function getCurrencySymbol(stockSymbol: string): string {
  // Simple mapping of currency symbols
  // This could be expanded based on the stock exchanges or other logic
  const currencyMap: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    CNY: "¥",
    AUD: "A$",
    CAD: "C$",
    // Add more currency symbols as needed
  };

  // For Indian stocks (typically ending with .NS for NSE or .BO for BSE)
  if (stockSymbol.endsWith(".NS") || stockSymbol.endsWith(".BO")) {
    return currencyMap.INR || "₹";
  }

  // For most US stocks (default case)
  return currencyMap.USD || "$";
}
