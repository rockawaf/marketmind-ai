const marketData = {
    sp500: "+0.42%",
    nasdaq: "+0.61%",
    treasury: "4.28%",
    brent: "$71.32",
    inflation: "2.4%",
    ethereum: "$3,250"
};
//document.getElementById("sp500-value").textContent = marketData.sp500;
//document.getElementById("nasdaq-value").textContent = marketData.nasdaq;
//document.getElementById("treasury-value").textContent = marketData.treasury;
//document.getElementById("brent-value").textContent = marketData.brent;
//document.getElementById("inflation-value").textContent = marketData.inflation;
//document.getElementById("ethereum-value").textContent = marketData.ethereum;

for (let key in marketData) {
    document.getElementById(key + "-value").textContent = marketData[key];

}
console.log(marketData);
