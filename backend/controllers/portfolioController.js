import Portfolio from '../models/Portfolio.js';

// @desc    Get logged in user's portfolio
// @route   GET /api/portfolio
// @access  Private
export const getPortfolio = async (req, res, next) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id }).populate('holdings.asset');
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id, holdings: [] });
    }
    return res.json(portfolio);
  } catch (error) {
    next(error);
  }
};

