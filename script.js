const marketData = {
  sp500: "+0.42%",
  nasdaq: "+0.61%",
  treasury: "4.28%",
  brent: "$71.32",
  inflation: "2.4%"
};

for (let key in marketData) {
  const element = document.getElementById(key + "-value");

  if (element) {
    element.textContent = marketData[key];

    if (marketData[key].startsWith("+")) {
      element.style.color = "lime";
    } else if (marketData[key].startsWith("-")) {
      element.style.color = "red";
    } else {
      element.style.color = "white";
    }
  }
}

function loadPrices() {
  fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd&include_24hr_change=true")
    .then(response => response.json())
    .then(data => {
      const coins = Object.keys(data);

      for (const coin of coins) {
        const priceElement = document.getElementById(coin + "-price");
        const changeElement = document.getElementById(coin + "-change");

        const price = data[coin].usd;
        const change = data[coin].usd_24h_change;

        if (priceElement) {
          priceElement.textContent = "$" + price.toLocaleString();
        }

        if (changeElement) {
          if (change > 0) {
            changeElement.textContent = "🟢 +" + change.toFixed(2) + "%";
            changeElement.style.color = "lime";
          } else if (change < 0) {
            changeElement.textContent = "🔴 " + change.toFixed(2) + "%";
            changeElement.style.color = "red";
          } else {
            changeElement.textContent = "0.00%";
            changeElement.style.color = "white";
          }
        }
      }

      const btcChange = data.bitcoin.usd_24h_change;
      const ethChange = data.ethereum.usd_24h_change;

      const summary = document.getElementById("market-summary");

      if (summary) {
        if (btcChange > 0 && ethChange > 0) {
          summary.textContent =
            "🟢 Crypto markets are strong today. Bitcoin and Ethereum are both trading higher.";
        } else if (btcChange < 0 && ethChange < 0) {
          summary.textContent =
            "🔴 Crypto markets are under pressure today. Bitcoin and Ethereum are both declining.";
        } else {
          summary.textContent =
            "🟡 Crypto markets are mixed today. One major asset is rising while the other is falling.";
        }
      }
    });
}

loadPrices();
setInterval(loadPrices, 30000);