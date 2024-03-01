const axios = require('axios');

const apiKey = 'ZS1Z5GB1YWD4U9B9';
const symbol = 'AAPL'; // Example stock symbol

const fetchStockData = async () => {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);
    const data = response.data['Time Series (Daily)'];
    const labels = Object.keys(data).slice(0, 7); // Get labels for the last 7 days
    const prices = labels.map((date) => data[date]['4. close']); // Closing prices
    return { labels, prices };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return { error: 'Error fetching stock data' };
  }
};

module.exports = { fetchStockData };
