const mongoose = require('mongoose');
const { Schema } = mongoose;

const superStoresSchema = new Schema({
    "Category": String,
    "city": String,
    "Country/Region": String,
    "Customer ID": String,
    "Customer Name": String,
    "Discount": Number,
    "Order Date": Date,
    "Order ID": String,
    "Product ID": String,
    "Product Name": String,
    "Profit": Number,
    "Quantity": Number,
    "Region": String,
    "Row ID": Number,
    "Sales": Number,
    "Segment": String,
    "Ship Date": Date,
    "Ship Mode": String,
    "state": String,
    "Sub-Category": String
});

module.exports = {superStoresSchema: superStoresSchema };
