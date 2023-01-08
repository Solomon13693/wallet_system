const express = require('express')
const morgan = require('morgan')
const app = express()
require('dotenv').config()
const errorHandler = require('./middleware/error')
const ErrorResponse = require('./utils/errorResponse')
const connectDB = require('./config/Database')
const userRoute = require('./routes/userRoute')
const walletRoute = require('./routes/walletRoute')
const transferRoute = require('./routes/transferRoute')
const billsRoute = require('./routes/billRoute')
const path = require('path');



app.use(morgan('dev'))

connectDB()

app.use(express.json())

// ROUTES
app.use('/api/v1/auth/', userRoute)
app.use('/api/v1/', walletRoute)
app.use('/api/v1/transfer', transferRoute)
app.use('/api/v1/bills', billsRoute)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/view/index.html"));
});

app.use('*', (req, res, next) => {
    return next(
        new ErrorResponse(`No routes found for ${req.baseUrl}`, 404)
    );
})


app.use(errorHandler)

module.exports = app