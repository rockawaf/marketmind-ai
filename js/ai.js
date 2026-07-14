function generateAIInsight() {
  const summary = document.getElementById("market-summary");

  if (!summary) return;

  let cryptoMood;
  let sentiment;
  let outlook;

  if (marketState.btcChange > 0 && marketState.ethChange > 0) {

      cryptoMood = "Bitcoin and Ethereum are both gaining today.";

  } else if (marketState.btcChange < 0 && marketState.ethChange < 0) {

      cryptoMood = "Bitcoin and Ethereum are both trading lower today.";

  } else {

     cryptoMood = "Major cryptocurrencies are moving in different directions today.";

  }


  if (marketState.fearGreed >= 75) {

      sentiment = "Investor sentiment is extremely optimistic.";

      outlook = "Markets appear comfortable taking on risk.";

  }

  else if (marketState.fearGreed >= 55) {

      sentiment = "Overall market sentiment remains positive.";

      outlook = "Buyers continue to show confidence.";

  }

  else if (marketState.fearGreed >= 45) {

      sentiment = "Market sentiment is relatively balanced.";

      outlook = "Investors are waiting for stronger signals.";

  }

  else if (marketState.fearGreed >= 25) {

      sentiment = "Investors are becoming increasingly cautious.";

      outlook = "Risk appetite is fading.";

  }

  else {

      sentiment = "Markets are experiencing extreme fear.";

      outlook = "Investors are avoiding risk assets.";
  }

  summary.innerHTML = `
   <p>${cryptoMood}</p>

   <p>${sentiment}</p>

   <ul>
     <li>📊 Fear & Greed Index: <strong>${marketState.fearGreed}</strong> (${marketState.fearLabel})</li>
     <li>📰 Top headline: ${marketState.newsHeadline}</li>
   </ul>

  <p>
  <strong>AI Outlook:</strong> ${outlook}
  </p>
  `;
}