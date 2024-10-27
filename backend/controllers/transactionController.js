const transactionService = require('../services/transactionservice');
const monthHelper = require('../utils/monthHelper');
const axios = require('axios');
// controllers/transactionController.js or services/transactionService.js
const Transaction = require('../models/Transaction'); // Adjust the path as necessary

exports.listTransactions = async (req, res) => {
  try {
    const { month, search, page, perPage } = req.query;
    const monthNumber = monthHelper.convertMonthToNumber(month);
    const data = await transactionService.getTransactions(monthNumber, search, page, perPage);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = monthHelper.convertMonthToNumber(month);
    const stats = await transactionService.listStatistics(monthNumber);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Bar Chart Data
exports.getBarChart = async (req, res) => {
    try {
      const { month } = req.query;
      const monthNumber = new Date(`${month} 1`).getMonth() + 1;
  
      const transactions = await Transaction.find({
        $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }
      });
  
      const priceRanges = {
        '0-100': 0, '101-200': 0, '201-300': 0, '301-400': 0, '401-500': 0,
        '501-600': 0, '601-700': 0, '701-800': 0, '801-900': 0, '901-above': 0
      };
  
      transactions.forEach(transaction => {
        const price = transaction.price;
        if (price <= 100) priceRanges['0-100']++;
        else if (price <= 200) priceRanges['101-200']++;
        else if (price <= 300) priceRanges['201-300']++;
        else if (price <= 400) priceRanges['301-400']++;
        else if (price <= 500) priceRanges['401-500']++;
        else if (price <= 600) priceRanges['501-600']++;
        else if (price <= 700) priceRanges['601-700']++;
        else if (price <= 800) priceRanges['701-800']++;
        else if (price <= 900) priceRanges['801-900']++;
        else priceRanges['901-above']++;
      });
  
      res.json(priceRanges);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Pie Chart Data
  exports.getPieChart = async (req, res) => {
    try {
      const { month } = req.query;
      console.log(month);
      const monthNumber = new Date(`${month} 1`).getMonth() + 1;
  console.log(monthNumber);
//   const transactions = await Transaction.find({});
// console.log(transactions);

const categoryData = await Transaction.aggregate([
    { 
        $match: { 
            $expr: { 
                $eq: [{ $month: '$dateOfSale' }, monthNumber] 
            } 
        } 
    },
    { 
        $group: { 
            _id: '$category', 
            count: { $sum: 1 } 
        } 
    }
]);

  console.log(categoryData);
      const result = categoryData.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
      console.log(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Combined Data
  exports.getCombinedData = async (req, res) => {
    try {
      const { month } = req.query;
      
      // Call each API directly
      const [statistics, barChart, pieChart] = await Promise.all([
        axios.get(`http://localhost:3000/api/statistics?month=${month}`),
        axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
        axios.get(`http://localhost:3000/api/pie-chart?month=${month}`)
      ]);
  
      res.json({
        statistics: statistics.data,
        barChart: barChart.data,
        pieChart: pieChart.data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
