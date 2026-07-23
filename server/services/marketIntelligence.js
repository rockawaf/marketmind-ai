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

  function scoreEquityMove(change) {
    if (!Number.isFinite(change)) return 0;

    if (change >= 2) return 10;
    if (change >= 0.5) return 6;
    if (change > -0.5) return 0;
    if (change > -2) return -6;

    return -10;
  }

  function scoreCryptoMove(change) {
    if (!Number.isFinite(change)) return 0;

    if (change >= 4) return 10;
    if (change >= 1) return 5;
    if (change > -1) return 0;
    if (change > -4) return -5;

    return -10;
  }

  score += scoreEquityMove(spyChange);
  score += scoreEquityMove(qqqChange);
  score += scoreCryptoMove(bitcoinChange);
  score += scoreCryptoMove(ethereumChange) / 2;

  if (Number.isFinite(vix)) {
    if (vix < 15) score += 10;
    else if (vix < 20) score += 5;
    else if (vix < 25) score -= 2;
    else if (vix < 30) score -= 8;
    else score -= 15;
  }

  if (Number.isFinite(treasury10y)) {
    if (treasury10y < 4) score += 5;
    else if (treasury10y >= 5) score -= 5;
  }

  return Math.round(Math.max(0, Math.min(score, 100)));
}

function getMood(score) {
  if (score >= 70) return "Risk-On";
  if (score <= 30) return "Risk-Off";

  return "Neutral";
}

function buildOpeningSentence(mood, primaryDriver) {
  if (!primaryDriver) {
    return `${mood} market conditions are prevailing today.`;
  }

  switch (primaryDriver.driver) {
    case "Weak cryptocurrency momentum":
      return "Markets are trading cautiously today as weak cryptocurrency momentum weighs on overall risk sentiment.";

    case "Technology weakness":
      return "Technology stocks are leading today's weakness, creating pressure across broader markets.";

    case "Elevated Treasury yields":
      return "Higher Treasury yields remain the dominant macro force, pressuring growth-oriented assets.";

    case "Low market volatility":
      return "Markets remain relatively calm, with low volatility continuing to support investor confidence.";

    default:
      return `${primaryDriver.driver} is the primary market driver today.`;
  }
}

function buildSummary({
  mood,
  stocks,
  crypto,
  macro,
  drivers = [],
}) {
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

  const primaryDriver = drivers[0];

  const opening = buildOpeningSentence(
    mood,
    primaryDriver
  );

  return `${opening} The S&P 500 is ${describeMove(
    spyChange
  )} (${formatPercent(spyChange)}), the Nasdaq is ${describeMove(
    qqqChange
  )} (${formatPercent(qqqChange)}), Bitcoin is ${describeMove(
    bitcoinChange
  )} (${formatPercent(bitcoinChange)}), and Ethereum is ${describeMove(
    ethereumChange
  )} (${formatPercent(ethereumChange)}). The VIX is ${
    Number.isFinite(vix) ? vix.toFixed(1) : "N/A"
  }, so ${volatilityDescription}. The 10-year Treasury yield is ${
    Number.isFinite(treasury10y)
      ? `${treasury10y.toFixed(2)}%`
      : "unavailable"
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
    if (spyChange >= 0.5) {
      reasons.push("The S&P 500 is supporting market sentiment.");
    } else if (spyChange <= -0.5) {
      reasons.push("The S&P 500 is weighing on market sentiment.");
    } else {
      reasons.push("The S&P 500 is broadly stable.");
    }
  }

  if (Number.isFinite(qqqChange)) {
    if (qqqChange >= 0.5) {
      reasons.push("Technology stocks are showing strength.");
    } else if (qqqChange <= -0.5) {
      reasons.push("Technology stocks are under pressure.");
    } else {
      reasons.push("Technology stocks are broadly stable.");
    }
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
      reasons.push(
        "Elevated volatility signals significant market uncertainty."
      );
    } else {
      reasons.push(
        "Moderate volatility reflects cautious investor sentiment."
      );
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

  const spyChange = Number(stocks?.sp500?.dp);
  const bitcoinChange = Number(crypto?.bitcoin?.usd_24h_change);
  const vix = Number(macro?.vix?.value);

  if (Number.isFinite(vix) && vix < 20) {
    highlights.push({
      level: "positive",
      title: "Low Market Volatility",
      message:
        "The VIX remains below 20, suggesting relatively calm market conditions.",
    });
  }

  if (Number.isFinite(spyChange) && spyChange < -1) {
    highlights.push({
      level: "warning",
      title: "Equity Weakness",
      message: "The S&P 500 is down more than 1% today.",
    });
  }

  if (Number.isFinite(bitcoinChange) && bitcoinChange > 3) {
    highlights.push({
      level: "positive",
      title: "Bitcoin Momentum",
      message: "Bitcoin is gaining more than 3% over the last 24 hours.",
    });
  }

  return highlights;
}

function identifyMarketDrivers({ stocks, crypto, macro }) {
  const drivers = [];

  const spyChange = Number(stocks?.sp500?.dp);
  const qqqChange = Number(stocks?.nasdaq?.dp);
  const bitcoinChange = Number(crypto?.bitcoin?.usd_24h_change);
  const ethereumChange = Number(crypto?.ethereum?.usd_24h_change);
  const vix = Number(macro?.vix?.value);
  const treasury10y = Number(macro?.treasury10y?.value);

  const addDriver = ({
    category,
    driver,
    impact,
    strength,
    explanation,
  }) => {
    drivers.push({
      category,
      driver,
      impact,
      strength,
      explanation,
    });
  };

  if (Number.isFinite(spyChange) && Number.isFinite(qqqChange)) {
    const averageEquityChange = (spyChange + qqqChange) / 2;

    if (averageEquityChange >= 1) {
      addDriver({
        category: "equities",
        driver: "Strong equity momentum",
        impact: "positive",
        strength: Math.abs(averageEquityChange),
        explanation:
          "Broad gains in the S&P 500 and Nasdaq are supporting investor risk appetite.",
      });
    } else if (averageEquityChange >= 0.5) {
      addDriver({
        category: "equities",
        driver: "Moderate equity strength",
        impact: "positive",
        strength: Math.abs(averageEquityChange),
        explanation:
          "Equity markets are advancing and contributing positively to sentiment.",
      });
    } else if (averageEquityChange <= -1) {
      addDriver({
        category: "equities",
        driver: "Strong equity weakness",
        impact: "negative",
        strength: Math.abs(averageEquityChange),
        explanation:
          "Broad weakness in the S&P 500 and Nasdaq is reducing investor risk appetite.",
      });
    } else if (qqqChange <= -0.5 || averageEquityChange <= -0.5) {
      addDriver({
        category: "equities",
        driver: "Technology weakness",
        impact: "negative",
        strength: Math.abs(averageEquityChange),
        explanation:
          "Technology stocks are leading today's weakness and weighing on broader market sentiment.",
      });
    }
  }

  if (
    Number.isFinite(bitcoinChange) &&
    Number.isFinite(ethereumChange)
  ) {
    const averageCryptoChange =
      (bitcoinChange + ethereumChange) / 2;

    if (averageCryptoChange >= 2) {
      addDriver({
        category: "crypto",
        driver: "Strong cryptocurrency momentum",
        impact: "positive",
        strength: Math.abs(averageCryptoChange),
        explanation:
          "Bitcoin and Ethereum are showing strong demand for speculative assets.",
      });
    } else if (averageCryptoChange >= 1) {
      addDriver({
        category: "crypto",
        driver: "Positive cryptocurrency momentum",
        impact: "positive",
        strength: Math.abs(averageCryptoChange),
        explanation:
          "Bitcoin and Ethereum are supporting broader risk appetite.",
      });
    } else if (averageCryptoChange <= -2) {
      addDriver({
        category: "crypto",
        driver: "Strong cryptocurrency weakness",
        impact: "negative",
        strength: Math.abs(averageCryptoChange),
        explanation:
          "Bitcoin and Ethereum are showing a sharp reduction in speculative demand.",
      });
    } else if (averageCryptoChange <= -0.5) {
      addDriver({
        category: "crypto",
        driver: "Weak cryptocurrency momentum",
        impact: "negative",
        strength: Math.abs(averageCryptoChange),
        explanation:
          "Bitcoin and Ethereum are weakening, suggesting softer speculative risk appetite.",
      });
    }
  }

  if (Number.isFinite(vix)) {
    if (vix < 20) {
      addDriver({
        category: "volatility",
        driver: "Low market volatility",
        impact: "positive",
        strength: (20 - vix) / 5,
        explanation:
          "A VIX below 20 suggests relatively calm equity-market conditions.",
      });
    } else if (vix >= 30) {
      addDriver({
        category: "volatility",
        driver: "Elevated market volatility",
        impact: "negative",
        strength: (vix - 20) / 5,
        explanation:
          "Elevated volatility signals heightened uncertainty and stronger demand for protection.",
      });
    }
  }

  if (Number.isFinite(treasury10y)) {
    if (treasury10y >= 4.5) {
      addDriver({
        category: "rates",
        driver: "Elevated Treasury yields",
        impact: "negative",
        strength: treasury10y - 4,
        explanation:
          "Higher Treasury yields may pressure growth stocks and other risk assets.",
      });
    } else if (treasury10y < 4) {
      addDriver({
        category: "rates",
        driver: "Supportive Treasury yields",
        impact: "positive",
        strength: 4 - treasury10y,
        explanation:
          "Lower Treasury yields can support equity valuations and risk assets.",
      });
    }
  }

  return drivers
    .sort((a, b) => b.strength - a.strength)
    .map((driver, index) => ({
      importance: index + 1,
      ...driver,
    }));
}

function detectDivergences({ stocks, crypto, macro, commodities }) {
  const divergences = [];

  const spy = Number(stocks?.sp500?.dp);
  const nasdaq = Number(stocks?.nasdaq?.dp);
  const bitcoin = Number(crypto?.bitcoin?.usd_24h_change);
  const vix = Number(macro?.vix?.value);
  const gold = Number(commodities?.gold?.percentChange);

  const trendingStocks = stocks?.trending
    ? Object.values(stocks.trending)
        .map((stock) => Number(stock?.dp))
        .filter(Number.isFinite)
    : [];

  // Stocks down while fear remains low
  if (
    Number.isFinite(spy) &&
    Number.isFinite(vix) &&
    spy < -0.5 &&
    vix < 20
  ) {
    divergences.push({
      type: "fear",
      title: "Calm Pullback",
      message:
        "Stocks are weakening, but the VIX remains low. Investors are not showing signs of significant panic.",
    });
  }

  // Nasdaq materially weaker than the S&P 500
  if (
    Number.isFinite(spy) &&
    Number.isFinite(nasdaq) &&
    nasdaq < spy - 0.3
  ) {
    divergences.push({
      type: "equity",
      title: "Technology Underperformance",
      message:
        "The Nasdaq is underperforming the S&P 500, suggesting pressure is concentrated in growth and technology stocks.",
    });
  }

  // Mixed performance among major technology stocks
  if (trendingStocks.length >= 3) {
    const positiveStocks = trendingStocks.filter((change) => change > 0.5);
    const negativeStocks = trendingStocks.filter((change) => change < -0.5);

    if (positiveStocks.length > 0 && negativeStocks.length > 0) {
      divergences.push({
        type: "breadth",
        title: "Uneven Technology Leadership",
        message:
          "Major technology stocks are moving in opposite directions, suggesting narrow and inconsistent market leadership.",
      });
    }
  }

  // Bitcoin materially weaker than equities
  if (
    Number.isFinite(bitcoin) &&
    Number.isFinite(spy) &&
    bitcoin < spy - 1
  ) {
    divergences.push({
      type: "crypto",
      title: "Crypto Underperforming",
      message:
        "Bitcoin is significantly weaker than the broader equity market, suggesting reduced speculative appetite.",
    });
  }

  // Gold rising while volatility remains low
  if (
    Number.isFinite(gold) &&
    Number.isFinite(vix) &&
    gold > 0.5 &&
    vix < 20
  ) {
    divergences.push({
      type: "safe-haven",
      title: "Quiet Defensive Buying",
      message:
        "Gold is attracting buyers even though market volatility remains subdued.",
    });
  }

  return divergences;
}

function generateWatchItems({ stocks, crypto, macro, divergences }) {
  const watchItems = [];

  const spy = Number(stocks?.sp500?.dp);
  const nasdaq = Number(stocks?.nasdaq?.dp);
  const bitcoin = Number(crypto?.bitcoin?.usd_24h_change);
  const vix = Number(macro?.vix?.value);
  const treasury10y = Number(macro?.treasury10y?.value);

  if (Number.isFinite(treasury10y) && treasury10y >= 4.5) {
    watchItems.push({
      indicator: "10-Year Treasury Yield",
      reason:
        "Yields remain elevated and could continue pressuring growth and technology stocks.",
    });
  }

  if (Number.isFinite(vix) && vix < 20) {
    watchItems.push({
      indicator: "VIX",
      reason:
        "Volatility remains low. A move above 20 would signal rising investor concern.",
    });
  }

  if (
    Number.isFinite(spy) &&
    Number.isFinite(nasdaq) &&
    nasdaq < spy - 0.3
  ) {
    watchItems.push({
      indicator: "Nasdaq vs S&P 500",
      reason:
        "Technology is underperforming the broader market. Watch whether that weakness spreads.",
    });
  }

  if (Number.isFinite(bitcoin) && bitcoin < -0.5) {
    watchItems.push({
      indicator: "Bitcoin",
      reason:
        "Bitcoin is weakening, which may signal softer speculative risk appetite.",
    });
  }

  if (Array.isArray(divergences) && divergences.length > 0) {
    watchItems.push({
      indicator: "Market Breadth",
      reason:
        "Current divergences suggest uneven participation beneath the index-level moves.",
    });
  }

  return watchItems;
}

function buildMarketAnalysis({
  stocks,
  crypto,
  macro,
  commodities,
}) {
  const score = calculateMarketScore({
    stocks,
    crypto,
    macro,
  });

  const mood = getMood(score);

  const drivers = identifyMarketDrivers({
    stocks,
    crypto,
    macro,
    commodities,
  });

  const divergences = detectDivergences({
    stocks,
    crypto,
    macro,
    commodities,
  });

  return {
    score,
    mood,

    summary: buildSummary({
      mood,
      stocks,
      crypto,
      macro,
      commodities,
      drivers,
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

    drivers,

    divergences,

    watchItems: generateWatchItems({
      stocks,
      crypto,
      macro,
      divergences,
    }),
  };
}

module.exports = {
  buildMarketAnalysis,
};