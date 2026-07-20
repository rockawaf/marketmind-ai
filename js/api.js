// ===============================
// Crypto prices — CoinGecko
// ===============================

import { $, setText, setColor, setPercent, fetchJSON } from "./dom.js";
import { marketState } from "./state.js";

let marketRequest = null;

function getMarketData() {
  if (!marketRequest) {
    marketRequest = fetchJSON("http://localhost:3000/api/market")
      .catch(error => {
        marketRequest = null;
        throw error;
      });
  }

  return marketRequest;
}


export function loadPrices() {
  getMarketData()
    .then(data => {
      const bitcoin = data?.crypto?.bitcoin;
      const ethereum = data?.crypto?.ethereum;

      if (
        !Number.isFinite(bitcoin?.usd) ||
        !Number.isFinite(bitcoin?.usd_24h_change) ||
        !Number.isFinite(ethereum?.usd) ||
        !Number.isFinite(ethereum?.usd_24h_change)
      ) {
        throw new Error("Invalid crypto data returned");
      }

      setText(
        "bitcoin-price",
        `$${bitcoin.usd.toLocaleString()}`
      );

      setText(
        "ethereum-price",
        `$${ethereum.usd.toLocaleString()}`
      );

      setText(
        "pulse-bitcoin-price",
        `$${bitcoin.usd.toLocaleString()}`
      );

      setText(
        "pulse-ethereum-price",
        `$${ethereum.usd.toLocaleString()}`
      );

      setPercent(
        $("bitcoin-change"),
        bitcoin.usd_24h_change
      );

      setPercent(
        $("ethereum-change"),
        ethereum.usd_24h_change
      );

      setPercent(
        $("pulse-bitcoin-change"),
        bitcoin.usd_24h_change
      );

      setPercent(
        $("pulse-ethereum-change"),
        ethereum.usd_24h_change
      );

      marketState.btcChange = bitcoin.usd_24h_change;
      marketState.ethChange = ethereum.usd_24h_change;
    })
    .catch(error => {
      console.error("Crypto loading error:", error);

      setText("bitcoin-price", "Unavailable");
      setText("ethereum-price", "Unavailable");
      setText("pulse-bitcoin-price", "Unavailable");
      setText("pulse-ethereum-price", "Unavailable");
    });
}

// ===============================
// S&P 500 and Nasdaq proxies
// ===============================


export function loadSP500() {
  getMarketData()
    .then(data => {
      const change = Number(data?.stocks?.sp500?.dp);

      if (!Number.isFinite(change)) {
        throw new Error("Invalid S&P 500 data returned");
      }

      setPercent($("sp500-value"), change);
      setPercent($("pulse-sp500-value"), change);
    })
    .catch(error => {
      console.error("S&P 500 loading error:", error);

      setText("sp500-value", "Unavailable");
      setText("pulse-sp500-value", "Unavailable");

      setColor("sp500-value", "white");
      setColor("pulse-sp500-value", "white");
    });
}

export function loadNasdaq() {
  getMarketData()
    .then(data => {
      const change = Number(data?.stocks?.nasdaq?.dp);

      if (!Number.isFinite(change)) {
        throw new Error("Invalid Nasdaq data returned");
      }

      setPercent($("nasdaq-value"), change);
      setPercent($("pulse-nasdaq-value"), change);
    })
    .catch(error => {
      console.error("Nasdaq loading error:", error);

      setText("nasdaq-value", "Unavailable");
      setText("pulse-nasdaq-value", "Unavailable");

      setColor("nasdaq-value", "white");
      setColor("pulse-nasdaq-value", "white");
    });
}


// ===============================
// Fear & Greed Index
// ===============================

export function loadFearGreed() {
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

      
    })
    .catch(error => {
      console.error("Fear & Greed loading error:", error);

      setText("fear-value", "Unavailable");
      setText("fear-label", "");
    });
}


// ===============================
// Macro and commodities — unified market endpoint
// ===============================

export function loadMacroData() {
  getMarketData()
    .then(data => {
      const treasury = Number(data?.macro?.treasury10y?.value);
      const inflation = Number(data?.macro?.inflationRate?.value);
      const dollar = Number(data?.macro?.broadDollar?.value);
      const vix = Number(data?.macro?.vix?.value);

      const brent = Number(data?.commodities?.brent?.value);
      const gold = Number(data?.commodities?.gold?.price);

      setText(
        "treasury-value",
        Number.isFinite(treasury)
          ? `${treasury.toFixed(2)}%`
          : "Unavailable"
      );

      setText(
        "inflation-value",
        Number.isFinite(inflation)
          ? `${inflation.toFixed(2)}%`
          : "Unavailable"
      );

      setText(
        "dxy-price",
        Number.isFinite(dollar)
          ? dollar.toFixed(2)
          : "Unavailable"
      );

      setText(
        "vix-price",
        Number.isFinite(vix)
          ? vix.toFixed(2)
          : "Unavailable"
      );

      setText(
        "oil-price",
        Number.isFinite(brent)
          ? `$${brent.toFixed(2)}`
          : "Unavailable"
      );

      setText(
        "gold-price",
        Number.isFinite(gold)
          ? `$${gold.toFixed(2)}`
          : "Unavailable"
      );
    })
    .catch(error => {
      console.error("Market data loading error:", error);

      setText("treasury-value", "Unavailable");
      setText("inflation-value", "Unavailable");
      setText("dxy-price", "Unavailable");
      setText("vix-price", "Unavailable");
      setText("oil-price", "Unavailable");
      setText("gold-price", "Unavailable");
    });
}



// ===============================
// MarketMind Intelligence
// ===============================

export async function loadMarketIntelligence() {
  const data = await getMarketData();

  if (!data?.intelligence) {
    throw new Error("No market intelligence returned");
  }

  return data.intelligence;
}