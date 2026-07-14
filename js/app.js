loadPrices();
loadSP500();
loadNasdaq();
loadNews();
loadTrendingStocks();
loadFearGreed();
loadMacroData();

setInterval(loadPrices, CONFIG.refresh.prices);

// Optional
setInterval(loadNews, CONFIG.refresh.news);
setInterval(loadFearGreed, CONFIG.refresh.fearGreed);
setInterval(loadTrendingStocks, CONFIG.refresh.prices);
setInterval(loadMacroData, CONFIG.refresh.prices);