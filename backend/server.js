require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Require cors
const bodyParser = require('body-parser');
const axios = require('axios');
const transactionRoutes = require('./routes/transactions');
const Transaction = require('./models/Transaction');

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Database
const initializeDatabase = async () => {
    try {
      const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      await Transaction.deleteMany({});
      await Transaction.insertMany(response.data);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error.message);
    }
  };
  

// MongoDB Connection
 const mongoURI = process.env.MONGO_URI;
// mongoose.connect(mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => console.log("MongoDB connected successfully"))
// .catch(err => console.error("MongoDB connection error:", err));

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log("MongoDB connected successfully");
    await initializeDatabase(); // Call the initialization function after connection
})
.catch(err => console.error("MongoDB connection error:", err));



// Routes
app.get('/', (req, res) => {
    res.send("API is running");
});

// Start server after DB connection
const PORT = process.env.PORT || 3000;
mongoose.connection.once('open', () => {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
});
app.use('/api', transactionRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});
