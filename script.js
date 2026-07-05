const marketData = {
    sp500: "+0.42%",
    nasdaq: "+0.61%",
    treasury: "4.28%",
    bitcoin: "$108,300",
    brent: "$71.32",
    inflation: "2.4%",
    ethereum: "$3,250"
};
document.getElementById("sp500-value").textContent = marketData.sp500;

document.getElementById("nasdaq-value").textContent = marketData.nasdaq;

document.getElementById("treasury-value").textContent = marketData.treasury;

document.getElementById("brent-value").textContent = marketData.brent;

document.getElementById("inflation-value").textContent = marketData.inflation;

document.getElementById("ethereum-value").textContent = marketData.ethereum;

console.log(marketData);

console.log(marketData.sp500);
console.log(marketData.nasdaq);
console.log(marketData.treasury);
console.log(marketData.bitcoin);
console.log(marketData.brent);
console.log(marketData.inflation);
console.log(marketData.ethereum);