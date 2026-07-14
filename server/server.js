require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/quote", async (req, res) => {
  const symbol = req.query.symbol?.trim().toUpperCase();

  if (!symbol) {
    return res.status(400).json({
      error: "A symbol is required"
    });
  }

  try {
    const url =
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}` +
      `&token=${process.env.FINNHUB_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Finnhub failed for ${symbol}: ${response.status}`);

      return res.status(response.status).json({
        error: `Finnhub request failed for ${symbol}`,
        status: response.status
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(`Server error for ${symbol}:`, error.message);

    res.status(500).json({
      error: `Unable to fetch ${symbol}`
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});