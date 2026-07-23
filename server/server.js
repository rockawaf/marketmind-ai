require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  buildMarketAnalysis,
} = require("./services/marketIntelligence");

const app = express();

app.use(cors());

app.get("/api/quote", async (req, res) => {
  const symbol = req.query.symbol?.trim().toUpperCase();

  if (!symbol) {
    return res.status(400).json({
      error: "A symbol is required",
    });
  }

  try {
    const data = await fetchQuote(symbol);
    res.json(data);
  } catch (error) {
    console.error(`Quote error for ${symbol}:`, error.message);

    res.status(500).json({
      error: `Unable to fetch ${symbol}`,
    });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_KEY}`,
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Finnhub news request failed",
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("News error:", error.message);

    res.status(500).json({
      error: "Unable to fetch market news",
    });
  }
});

const cryptoCache = {
  bitcoin: null,
  ethereum: null,
};

const cryptoCacheTime = {
  bitcoin: 0,
  ethereum: 0,
};
const CRYPTO_CACHE_DURATION = 60_000; // 1 minute

async function fetchCryptoPrice(id) {
  const cacheIsFresh =
    cryptoCache[id] &&
    Date.now() - cryptoCacheTime[id] < CRYPTO_CACHE_DURATION;

  if (cacheIsFresh) {
    return cryptoCache[id];
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(
        `CoinGecko request failed for ${id}: ${response.status}`
      );
    }

    const data = await response.json();
    const crypto = data?.[id];

    if (
      !Number.isFinite(crypto?.usd) ||
      !Number.isFinite(crypto?.usd_24h_change)
    ) {
      throw new Error(
        `Invalid CoinGecko data returned for ${id}`
      );
    }

    cryptoCache[id] = crypto;
    cryptoCacheTime[id] = Date.now();

    return crypto;
  } catch (error) {
    if (cryptoCache[id]) {
      console.warn(
        `Using cached ${id} data:`,
        error.message
      );

      return cryptoCache[id];
    }

    throw error;
  }
}


const { fetchQuote } = require("./services/finnhub");

async function fetchGoldPrice() {
  const response = await fetch(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent("XAU/USD")}&apikey=${process.env.TWELVEDATA_API_KEY}`
  );

  const data = await response.json();

  return {
    symbol: data.symbol,
    name: data.name,
    price: Number(data.close),
    change: Number(data.change),
    percentChange: Number(data.percent_change),
    marketOpen: data.is_market_open,
    timestamp: data.timestamp,
  };
}

async function fetchLatestFredValue(seriesId) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: process.env.FRED_API_KEY,
    file_type: "json",
    sort_order: "desc",
    limit: "24",
  });

  const response = await fetch(
    `https://api.stlouisfed.org/fred/series/observations?${params}`,
  );

  if (!response.ok) {
    throw new Error(`FRED request failed for ${seriesId}: ${response.status}`);
  }

  const data = await response.json();

  const observation = data.observations?.find(
    (item) => item.value !== "." && Number.isFinite(Number(item.value)),
  );

  if (!observation) {
    throw new Error(`No valid FRED value found for ${seriesId}`);
  }

  return {
    value: Number(observation.value),
    date: observation.date,
    observations: data.observations,
  };
}

function calculateInflationRate(observations) {
  const valid = observations.filter(
    (obs) => obs.value !== "." && Number.isFinite(Number(obs.value))
  );

  if (valid.length < 13) {
    throw new Error("Not enough CPI observations.");
  }

  const current = Number(valid[0].value);
  const lastYear = Number(valid[12].value);

  const inflationRate =
    ((current - lastYear) / lastYear) * 100;

  return Number(inflationRate.toFixed(2));
}

async function fetchQuoteSafely(symbol) {
  try {
    return await fetchQuote(symbol);
  } catch (error) {
    console.error(`${symbol} quote failed:`, error.message);

    return null;
  }
}

app.get("/api/market", async (req, res) => {
  try {
     const [
       treasury10y,
       cpi,
       broadDollar,
       brent,
       vix,
       gold,
       spy,
       qqq,
       aapl,
       nvda,
       msft,
       googl,
       bitcoinResult,
       ethereumResult,
     ] = await Promise.all([
       fetchLatestFredValue("DGS10"),
       fetchLatestFredValue("CPIAUCSL"),
       fetchLatestFredValue("DTWEXBGS"),
       fetchLatestFredValue("DCOILBRENTEU"),
       fetchLatestFredValue("VIXCLS"),
       fetchGoldPrice(),

       fetchQuote("SPY"),
       fetchQuote("QQQ"),

       fetchQuoteSafely("AAPL"),
       fetchQuoteSafely("NVDA"),
       fetchQuoteSafely("MSFT"),
       fetchQuoteSafely("GOOGL"),

       fetchCryptoPrice("bitcoin").catch((error) => {
         console.error(
           "Bitcoin request failed:",
           error.message
         );

         return null;
       }),

       fetchCryptoPrice("ethereum").catch((error) => {
         console.error(
           "Ethereum request failed:",
           error.message
         );

         return null;
       }),
     ]);

     const bitcoin = bitcoinResult ?? {
       usd: null,
       usd_24h_change: null,
     };

     const ethereum = ethereumResult ?? {
       usd: null,
       usd_24h_change: null,
     };

    const stocks = {
      sp500: spy,
      nasdaq: qqq,

      trending: {
        aapl,
        nvda,
        msft,
        googl,
      },
    };

    const crypto = {
      bitcoin,
      ethereum,
    };

    const macro = {
      treasury10y: {
        value: treasury10y.value,
        date: treasury10y.date,
      },
      
    inflationRate: {
      value: calculateInflationRate(cpi.observations),
       date: cpi.date,
    },

    broadDollar: {
       value: broadDollar.value,
       date: broadDollar.date,
    },

    vix: {
      value: vix.value,
       date: vix.date,
    },
  };

  const commodities = {
     gold,

    brent: {
      value: brent.value,
      date: brent.date,
    },
  };

  const intelligence = buildMarketAnalysis({
    stocks,
    crypto,
     macro,
     commodities,
  });

  res.json({
    stocks,
     crypto,
     macro,
    commodities,
    intelligence,
    news: [],
    timestamp: new Date().toISOString(),
  });
} catch (error) {
    console.error("Market endpoint error:", error.message);

    res.status(500).json({
      error: "Unable to load market data",
    });
  }
});

console.log("✅ Market route loaded");

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});