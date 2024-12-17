const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mySqlPool = require('./config/db');
const authenticateToken = require('./middleware/authentiactToken');

//configure dotenv
dotenv.config();

//create express object
const app = express();

//middleware
app.use(express.json());
app.use(morgan('dev'));
app.use('/auth', require("./authentication/login"));

// Apply token validation globally (except for public routes)
app.use(authenticateToken);
//routes
app.use("/api/product", require("./routes/products"));
app.use("/order", require("./routes/orders"));
app.use("/customer", require("./routes/customers"));
app.use("/cart", require("./routes/cart"));
app.use("/lens", require("./routes/contactLens"));
app.use("/wishlist", require("./routes/wishlist"));
app.use("/discount", require("./routes/coupons"))


app.get('/test', (req,res) => {
        res.status(200).send('Server online');
});

//port
const PORT = 8080;

//conditionally listen
mySqlPool.query('SELECT 1').then(() => {
    console.log('Connected to Database......')

//listen
    app.listen(PORT, () => {
        console.log('server is running');
    });
}).catch((error) => {
    console.log(error);
})

