export function getCurrencySymbol(ticker: string): string {
  // Check if ticker ends with .NS (NSE) or .BO (BSE) for Indian stocks
  if (ticker && (ticker.endsWith(".NS") || ticker.endsWith(".BO"))) {
    return "₹"
  }

  // Default to USD
  return "$"
}
