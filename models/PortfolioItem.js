const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  carouselImages: [String],
  names: [{
    locale: String,
    name: String
  }],
  descriptions: [{
    locale: String,
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);

module.exports = PortfolioItem;
