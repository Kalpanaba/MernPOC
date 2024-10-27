const Transaction = require('../models/Transaction');

// exports.getTransactions = async (monthNumber, search, page = 1, perPage = 10) => {
//   const query = { $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] } };
//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: 'i' } },
//       { description: { $regex: search, $options: 'i' } },
//       { price: isNaN(search) ? undefined : Number(search) }
//     ].filter(Boolean);
//   }
  
//   const transactions = await Transaction.find(query)
//     .skip((page - 1) * perPage)
//     .limit(perPage);
//   const total = await Transaction.countDocuments(query);

//   return {
//     transactions,
//     total,
//     page: Number(page),
//     totalPages: Math.ceil(total / perPage),
//   };
// };

exports.getTransactions = async (monthNumber, search, page = 1, perPage = 10) => {
    // Build the query to filter transactions by month
    const query = { $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] } };
  
    // If a search parameter is provided, enhance the query with search criteria
    if (search) {
      // Create an array to hold the search conditions
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } }, // Search in title
        { description: { $regex: search, $options: 'i' } }, // Search in description
      ];
  
      // Check if search is a number to filter by price
      const priceSearch = Number(search);
      if (!isNaN(priceSearch)) {
        searchConditions.push({ price: priceSearch }); // Add price condition
      }
  
      // Combine all search conditions
      query.$or = searchConditions;
    }
  
    try {
      // Fetch transactions with pagination
      const transactions = await Transaction.find(query)
        .skip((page - 1) * perPage) // Calculate skip for pagination
        .limit(perPage) // Limit the number of results per page
        .sort({ dateOfSale: -1 }); // Optional: sort by date of sale (newest first)
  
      // Count total matching transactions for pagination info
      const total = await Transaction.countDocuments(query);
  
      // Return results with pagination details
      return {
        transactions,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / perPage),
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Error fetching transactions');
    }
  };
  
exports.listStatistics = async (monthNumber) => {
    try {
        // Total sold items in the selected month
        const totalSoldItems = await Transaction.countDocuments({
            $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
            price: { $gt: 0 } // Assuming sold items have a price greater than 0
        });

        // Total sale amount of the selected month
        const totalRevenue = await Transaction.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price' }
                }
            }
        ]);

        // Total not sold items (assuming you have a way to track them)
        const totalItems = await Transaction.countDocuments(); // Total items in the database
        const totalNotSoldItems = totalItems - totalSoldItems;

        return {
            totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0, // Total sale amount
            totalSoldItems, // Total sold items
            totalNotSoldItems // Total not sold items
        };
    } catch (error) {
        console.error("Error calculating statistics:", error);
        throw new Error('Error calculating statistics'); // Handle error appropriately
    }
};