const axios = require('axios');

const apiKey = 'ee72350e04984cdc9d30cad2854838a0';
const country = 'us'; // Example country code for news

const fetchNews = async () => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`);
    const articles = response.data.articles;
    return articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return { error: 'Error fetching news' };
  }
};

module.exports = { fetchNews };
