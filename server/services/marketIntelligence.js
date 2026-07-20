function describeMove(change) {
  if (!Number.isFinite(change)) return "unavailable";

  if (change >= 2) return "rising sharply";
  if (change >= 0.5) return "higher";
  if (change > -0.5) return "mostly unchanged";
  if (change > -2) return "lower";

  return "falling sharply";
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "N/A";

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(2)}%`;
}

function calculateMarketScore({ stocks, crypto, macro }) {
  let score = 50;

  const spyChange = Number(stocks?.sp500?.dp);
  const qqqChange = Number(stocks?.nasdaq?.dp);
  const bitcoinChange = Number(crypto?.bitcoin?.usd_24h_change);
  const ethereumChange = Number(crypto?.ethereum?.usd_24h_change);
  const vix = Number(macro?.vix?.value);
  const treasury10y = Number(macro?.treasury10y?.value);

  if (Number.isFinite(spyChange)) {
    score += spyChange > 0 ? 10 : -10;
  }

  if (Number.isFinite(qqqChange)) {
    score += qqqChange > 0 ? 10 : -10;
  }

  if (Number.isFinite(bitcoinChange)) {
    score += bitcoinChange > 0 ? 10 : -10;
  }

  if (Number.isFinite(ethereumChange)) {
    score += ethereumChange > 0 ? 5 : -5;
  }

  if (Number.isFinite(vix)) {
    if (vix < 20) score += 10;
    else if (vix >= 30) score -= 15;
    else score -= 5;
  }

  if (Number.isFinite(treasury10y)) {
    if (treasury10y < 4) score += 5;
    else if (treasury10y >= 5) score -= 5;
  }

  return Math.max(0, Math.min(score, 100));
}

function getMood(score) {
  if (score >= 70) return "Risk-On";
  if (score <= 30) return "Risk-Off";

  return "Neutral";
}

function buildSummary({ mood, stocks, crypto, macro }) {
  const spyChange = Number(stocks?.sp500?.dp);
  const qqqChange = Number(stocks?.nasdaq?.dp);
  const bitcoinChange = Number(crypto?.bitcoin?.usd_24h_change);
  const ethereumChange = Number(crypto?.ethereum?.usd_24h_change);
  const vix = Number(macro?.vix?.value);
  const treasury10y = Number(macro?.treasury10y?.value);

  const volatilityDescription =
    vix < 20
      ? "volatility remains low"
      : vix >= 30
        ? "volatility is elevated"
        : "volatility is moderate";

  return `${mood}: The S&P 500 is ${describeMove(spyChange)} (${formatPercent(
    spyChange
  )}), the Nasdaq is ${describeMove(qqqChange)} (${formatPercent(
    qqqChange
  )}), Bitcoin is ${describeMove(bitcoinChange)} (${formatPercent(
    bitcoinChange
  )}), and Ethereum is ${describeMove(ethereumChange)} (${formatPercent(
    ethereumChange
  )}). The VIX is ${Number.isFinite(vix) ? vix.toFixed(1) : "N/A"}, so ${volatilityDescription}. The 10-year Treasury yield is ${
    Number.isFinite(treasury10y) ? `${treasury10y.toFixed(2)}%` : "unavailable"
  }.`;
}

function explainScore({ stocks, crypto, macro }) {
  const reasons = [];

  const spyChange = Number(stocks?.sp500?.dp);
  const qqqChange = Number(stocks?.nasdaq?.dp);
  const bitcoinChange = Number(crypto?.bitcoin?.usd_24h_change);
  const ethereumChange = Number(crypto?.ethereum?.usd_24h_change);
  const vix = Number(macro?.vix?.value);
  const treasury10y = Number(macro?.treasury10y?.value);

  if (Number.isFinite(spyChange)) {
    reasons.push(
      spyChange >= 0
        ? "The S&P 500 is supporting market sentiment."
        : "The S&P 500 is weighing on market sentiment."
    );
  }

  if (Number.isFinite(qqqChange)) {
    reasons.push(
      qqqChange >= 0
        ? "Technology stocks are showing strength."
        : "Technology stocks are under pressure."
    );
  }

  if (Number.isFinite(bitcoinChange)) {
    reasons.push(
      bitcoinChange >= 0
        ? "Bitcoin is showing positive momentum."
        : "Bitcoin is showing negative momentum."
    );
  }

  if (Number.isFinite(ethereumChange)) {
    reasons.push(
      ethereumChange >= 0
        ? "Ethereum is strengthening."
        : "Ethereum is weakening."
    );
  }

  if (Number.isFinite(vix)) {
    if (vix < 20) {
      reasons.push("Low volatility suggests limited investor fear.");
    } else if (vix >= 30) {
      reasons.push("Elevated volatility signals significant market uncertainty.");
    } else {
      reasons.push("Moderate volatility reflects cautious investor sentiment.");
    }
  }

  if (Number.isFinite(treasury10y)) {
    if (treasury10y >= 5) {
      reasons.push("High Treasury yields may pressure risk assets.");
    } else if (treasury10y < 4) {
      reasons.push("Lower Treasury yields are supportive of risk assets.");
    }
  }

  return reasons;
}

function generateHighlights({ stocks, crypto, macro }) {
  const highlights = [];

  if (macro.vix.value < 20) {
    highlights.push({
      level: "positive",
      title: "Low Market Volatility",
      message: "The VIX remains below 20, suggesting relatively calm market conditions."
    });
  }

  if (stocks.sp500.dp < -1) {
    highlights.push({
      level: "warning",
      title: "Equity Weakness",
      message: "The S&P 500 is down more than 1% today."
    });
  }

  if (crypto.bitcoin.usd_24h_change > 3) {
    highlights.push({
      level: "positive",
      title: "Bitcoin Momentum",
      message: "Bitcoin is gaining more than 3% over the last 24 hours."
    });
  }

  return highlights;
}

function buildMarketAnalysis({ stocks, crypto, macro, commodities }) {
  const score = calculateMarketScore({
    stocks,
    crypto,
    macro,
  });

  const mood = getMood(score);

  return {
    score,
    mood,

    summary: buildSummary({
      mood,
      stocks,
      crypto,
      macro,
      commodities,
    }),

    reasons: explainScore({
      stocks,
      crypto,
      macro,
    }),

    highlights: generateHighlights({
      stocks,
      crypto,
      macro,
    }),
  };
}

function generateMarketSummary({
  stocks,
  crypto,
  macro,
  commodities,
}) {
  return buildMarketAnalysis({
    stocks,
    crypto,
    macro,
    commodities,
  });
}

module.exports = {
  generateMarketSummary,
};