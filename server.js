const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const mySqlPool = require('./config/db');
const authenticateToken = require('./middleware/authentiactToken');

// Configure dotenv
dotenv.config();

// Create express object
const app = express();

// Enable CORS for all origins
app.use(cors());

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Public routes
app.use("/api/product", require("./routes/products"));

// Authentication route
app.use('/auth', require("./authentication/login"));

// Apply token validation globally (except for public routes

// Routes
app.use("/order", require("./routes/orders"));
app.use("/customer", require("./routes/customers"));
app.use("/cart", require("./routes/cart"));
app.use("/lens", require("./routes/contactLens"));
app.use("/wishlist", require("./routes/wishlist"));
app.use("/discount", require("./routes/coupons"));
app.use("/profile", require("./routes/profile"));

// Test route
app.get('/test', (req, res) => {
    res.status(200).send('Server online');
});

// Port
const PORT = 8080;

// Conditionally listen
mySqlPool.query('SELECT 1').then(() => {
    console.log('Connected to Database......');

    // Listen
    app.listen(PORT, () => {
        console.log('server is running');
    });
}).catch((error) => {
    console.log(error);
});
