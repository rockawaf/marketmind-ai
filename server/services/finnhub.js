
async function fetchQuote(symbol) {
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${process.env.FINNHUB_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub request failed for ${symbol}`);
  }

  return await response.json();
}

module.exports = {
  fetchQuote,
};
