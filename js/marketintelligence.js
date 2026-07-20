export function analyzeMarket(data) {
    const score = calculateMarketScore(data);
    const mood = getMarketMood(score);
    const drivers = getMarketDrivers(data);
    const summary = generateSummary(mood, drivers);

    return {
        score,
        mood,
        drivers,
        summary,
    };
}

function calculateMarketScore(data) {
    let score = 0;

    // We'll build this next

    return score;
}

function getMarketMood(score) {
    if (score >= 4) return "🟢 Strong Risk-On";
    if (score >= 2) return "🟢 Moderately Bullish";
    if (score >= 0) return "🟡 Neutral";
    if (score >= -2) return "🟠 Cautious";

    return "🔴 Risk-Off";
}

function getMarketDrivers(data) {
    return [];
}

function generateSummary(mood, drivers) {
    return `${mood}.`;
}