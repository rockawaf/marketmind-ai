import { CONFIG } from "../js/config.js";

import {
  loadPrices,
  loadSP500,
  loadNasdaq,
  
  loadFearGreed,
  loadMacroData,
  loadMarketIntelligence,
} from "../js/api.js";

import { loadNews } from "../js/news.js";

async function displayMarketIntelligence() {
  const summaryContainer = document.querySelector("#market-summary");

  if (!summaryContainer) {
    console.error("Market summary container not found");
    return;
  }

  try {
    const intelligence = await loadMarketIntelligence();

    const moodIcons = {
      "Risk-On": "🟢",
      Neutral: "🟡",
      "Risk-Off": "🔴",
    };

    const moodIcon = moodIcons[intelligence.mood] ?? "⚪";

    const reasonsHTML = Array.isArray(intelligence.reasons)
      ? intelligence.reasons
          .map(reason => `<li>${reason}</li>`)
          .join("")
      : "";

    const highlightsHTML = Array.isArray(intelligence.highlights)
      ? intelligence.highlights
          .map(
            highlight => `
              <div class="intelligence-highlight ${highlight.level}">
                <h4>${highlight.title}</h4>
                <p>${highlight.message}</p>
              </div>
            `
          )
          .join("")
      : "";

    summaryContainer.innerHTML = `
      <div class="intelligence-header">
        <div>
          <span class="intelligence-label">Market Mood</span>
          <h3>${moodIcon} ${intelligence.mood}</h3>
        </div>

        <div class="intelligence-score">
          <span class="intelligence-label">Confidence</span>
          <strong>${intelligence.score}/100</strong>
        </div>
      </div>

      <div class="confidence-bar">
        <div
          class="confidence-fill"
          style="width: ${intelligence.score}%"
        ></div>
      </div>

      <div class="intelligence-section">
        <h4>Today's Outlook</h4>
        <p>${intelligence.summary}</p>
      </div>

      ${
        reasonsHTML
          ? `
            <div class="intelligence-section">
              <h4>Key Drivers</h4>
              <ul class="intelligence-reasons">
                ${reasonsHTML}
              </ul>
            </div>
          `
          : ""
      }

      ${
        highlightsHTML
          ? `
            <div class="intelligence-section">
              <h4>Highlights</h4>
              <div class="intelligence-highlights">
                ${highlightsHTML}
              </div>
            </div>
          `
          : ""
      }
    `;
  } catch (error) {
    console.error("Market intelligence error:", error);

    summaryContainer.innerHTML = `
      <p>Market intelligence is temporarily unavailable.</p>
    `;
  }
}

loadPrices();
loadSP500();
loadNasdaq();
loadNews();
//loadTrendingStocks();
loadFearGreed();
loadMacroData();
displayMarketIntelligence();

setInterval(loadPrices, CONFIG.refresh.prices);

// Optional
setInterval(loadNews, CONFIG.refresh.news);
setInterval(loadFearGreed, CONFIG.refresh.fearGreed);
//setInterval(loadTrendingStocks, CONFIG.refresh.trending);
setInterval(loadMacroData, CONFIG.refresh.macro);