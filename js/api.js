// ===============================
// Crypto prices — CoinGecko
// ===============================

function loadPrices() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    "?ids=bitcoin,ethereum,dogecoin" +
    "&vs_currencies=usd" +
    "&include_24hr_change=true";

  fetchJSON(url)
    .then(data => {
      const coins = Object.keys(data);

      for (const coin of coins) {
        const coinData = data[coin];

        if (
          typeof coinData?.usd !== "number" ||
          typeof coinData?.usd_24h_change !== "number"
        ) {
          continue;
        }

        const price = coinData.usd;
        const change = coinData.usd_24h_change;

        const priceElement = $(coin + "-price");
        const changeElement = $(coin + "-change");

        const pulsePriceElement = $("pulse-" + coin + "-price");
        const pulseChangeElement = $("pulse-" + coin + "-change");

        if (priceElement) {
          priceElement.textContent = "$" + price.toLocaleString();
        }

        if (pulsePriceElement) {
          pulsePriceElement.textContent = "$" + price.toLocaleString();
        }

        setPercent(changeElement, change);
        setPercent(pulseChangeElement, change);
      }

      marketState.btcChange = data.bitcoin.usd_24h_change;
      marketState.ethChange = data.ethereum.usd_24h_change;

      generateAIInsight();
    })
    .catch(error => {
      console.error("Crypto loading error:", error);

      setText("bitcoin-price", "Unavailable");
      setText("ethereum-price", "Unavailable");
      setText("dogecoin-price", "Unavailable");

      setText("pulse-bitcoin-price", "Unavailable");
      setText("pulse-ethereum-price", "Unavailable");
    });
}


// ===============================
// Backend quote helper
// ===============================

function getQuote(symbol) {
  const encodedSymbol = encodeURIComponent(symbol);

  return fetchJSON(
    `http://localhost:3000/api/quote?symbol=${encodedSymbol}`
  );
}


// ===============================
// S&P 500 and Nasdaq proxies
// ===============================

function updateIndexCards(symbol, elementIds) {
  getQuote(symbol)
    .then(data => {
      const hasValidChange =
        typeof data.dp === "number" &&
        Number.isFinite(data.dp);

      if (!hasValidChange) {
        throw new Error(`No valid quote data returned for ${symbol}`);
      }

      for (const id of elementIds) {
        setPercent($(id), data.dp);
      }
    })
    .catch(error => {
      console.error(`${symbol} loading error:`, error);

      for (const id of elementIds) {
        setText(id, "Unavailable");
        setColor(id, "white");
      }
    });
}

function loadSP500() {
  updateIndexCards("SPY", [
    "sp500-value",
    "pulse-sp500-value"
  ]);
}

function loadNasdaq() {
  updateIndexCards("QQQ", [
    "nasdaq-value",
    "pulse-nasdaq-value"
  ]);
}


// ===============================
// Fear & Greed Index
// ===============================

function loadFearGreed() {
  fetchJSON("https://api.alternative.me/fng/?limit=1")
    .then(data => {
      const result = data?.data?.[0];

      if (!result) {
        throw new Error("No Fear & Greed data returned");
      }

      const value = Number(result.value);
      const label = result.value_classification;

      if (!Number.isFinite(value)) {
        throw new Error("Invalid Fear & Greed value");
      }

      marketState.fearGreed = value;
      marketState.fearLabel = label;

      setText("fear-value", value);
      setText("fear-label", label);

      const valueElement = $("fear-value");

      if (valueElement) {
        if (value >= 75) {
          valueElement.style.color = "lime";
        } else if (value >= 55) {
          valueElement.style.color = "#5CDB95";
        } else if (value >= 45) {
          valueElement.style.color = "gold";
        } else if (value >= 25) {
          valueElement.style.color = "orange";
        } else {
          valueElement.style.color = "red";
        }
      }

      generateAIInsight();
    })
    .catch(error => {
      console.error("Fear & Greed loading error:", error);

      setText("fear-value", "Unavailable");
      setText("fear-label", "");
    });
}


// ===============================
// Macro assets
// ===============================

function loadMacroData() {
  const macroAssets = [
    { symbol: "GLD", id: "gold-price" },
    { symbol: "BNO", id: "oil-price" },
    { symbol: "UUP", id: "dxy-price" },
    { symbol: "VXX", id: "vix-price" }
  ];

  for (const asset of macroAssets) {
    getQuote(asset.symbol)
      .then(data => {
        const hasValidPrice =
          typeof data.c === "number" &&
          Number.isFinite(data.c) &&
          data.c > 0;

        if (hasValidPrice) {
          setText(asset.id, `$${data.c.toFixed(2)}`);
        } else {
          setText(asset.id, "Unavailable");
        }
      })
      .catch(error => {
        console.error(`${asset.symbol} loading error:`, error);
        setText(asset.id, "Unavailable");
      });
  }
}


// ===============================
// Trending stocks
// ===============================

function loadTrendingStocks() {
  const stocks = [
    { symbol: "AAPL", id: "aapl" },
    { symbol: "NVDA", id: "nvda" },
    { symbol: "MSFT", id: "msft" },
    { symbol: "GOOG", id: "goog" }
  ];

  for (const stock of stocks) {
    getQuote(stock.symbol)
      .then(data => {
        const priceElement = $(stock.id + "-price");
        const changeElement = $(stock.id + "-change");

        if (!priceElement || !changeElement) return;

        const hasValidPrice =
          typeof data.c === "number" &&
          Number.isFinite(data.c) &&
          data.c > 0;

        const hasValidChange =
          typeof data.dp === "number" &&
          Number.isFinite(data.dp);

        if (!hasValidPrice || !hasValidChange) {
          setText(stock.id + "-price", "Unavailable");
          setText(stock.id + "-change", "");
          return;
        }

        setText(
          stock.id + "-price",
          `$${data.c.toFixed(2)}`
        );

        setPercent(changeElement, data.dp);
      })
      .catch(error => {
        console.error(`${stock.symbol} loading error:`, error);

        setText(stock.id + "-price", "Unavailable");
        setText(stock.id + "-change", "");
      });
  }
}