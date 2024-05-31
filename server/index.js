const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const superStoresSchema = require('./superStoresSchema');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Define model once
const SuperStoreModel = mongoose.model("superstores", superStoresSchema.superStoresSchema);

app.listen(port, async () => {
    console.log(`Server is running. Port: ${port}`);
    try {
        await mongoose.connect('mongodb+srv://root:root@cluster0.t57dapi.mongodb.net/mut', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send("Hello World");
});

// GET all data
app.get('/getAllData', async (req, res) => {
    try {
        const { recordPerPage = '', pageNo = 1, productName = '', category = '', subCategory = '' } = req.query;

        const query = {};

        if (productName) {
            query["Product Name"] = { $regex: new RegExp(productName, 'i') };
        }

        if (category) {
            query["Category"] = { $regex: new RegExp(category, 'i') };
        }

        if (subCategory) {
            query["Sub-Category"] = { $regex: new RegExp(subCategory, 'i') };
        }

        const totalRecord = await SuperStoreModel.countDocuments(query);
        const data = await SuperStoreModel.find(query)
            .skip((parseInt(pageNo) - 1) * parseInt(recordPerPage))
            .limit(parseInt(recordPerPage));

        res.json({
            data: data,
            totalRecord: totalRecord
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE product
app.delete('/deleteProduct/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedProduct = await SuperStoreModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully", deletedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST add SuperStore
app.post('/addSuperStore', async (req, res) => {
    const params = req.body;
    const model = new SuperStoreModel(params);

    try {
        await model.save();
        res.json({
            status_code: 200,
            message: "SuperStore added successfully",
            data: model
        });
    } catch (error) {
        console.error("Error adding SuperStore:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT update SuperStore
app.put('/updateSuperStore/:id', async (req, res) => {
    const { id } = req.params;
    const params = req.body;

    try {
        const result = await SuperStoreModel.findByIdAndUpdate(id, params);
        res.json({ status_code: result ? 200 : 400 });
    } catch (error) {
        console.error("Error updating SuperStore:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET chart Sales and Profit
app.get('/chartSalesAndProfit', async (req, res) => {
    try {
        const { year } = req.query;

        const result = await SuperStoreModel.aggregate([
            {
                $project: {
                    "Product Name": 1,
                    "Order Date": 1,
                    "Sales": 1,
                    "Profit": 1
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$Order Date" },
                        year: { $year: "$Order Date" }
                    },
                    total_sales: { $sum: "$Profit" }
                }
            },
            {
                $match: {
                    "_id.year": parseInt(year)
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.json(result);
    } catch (error) {
        console.error("Error fetching chart data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET years
app.get('/getYear', async (req, res) => {
    try {
        const result = await SuperStoreModel.aggregate([
            {
                $project: {
                    _id: 0,
                    "Order Date": 1
                }
            },
            {
                $group: {
                    _id: { year: { $year: "$Order Date" } }
                }
            },
            {
                $sort: { "_id.year": 1 }
            }
        ]);

        res.json(result.map(el => el._id.year));
    } catch (error) {
        console.error("Error fetching years:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = app;
