const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const superStoresSchema = require('./superStoresSchema');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

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

app.get('/getAllData', async (req, res) => {
    const { recordPerPage = '', pageNo = 1, productName = '', category = '', subCategory = '' } = req.query;

    console.log("Query Parameters:", { recordPerPage, pageNo, productName, category, subCategory });

    try {
        const superStores = mongoose.model("superstores", superStoresSchema.superStoresSchema);

        let query = {};

        if (productName) {
            query["Product Name"] = { $regex: `.*${productName}.*`, $options: 'i' };
        }

        if (category) {
            query["Category"] = { $regex: `.*${category}.*`, $options: 'i' };
        }

        if (subCategory) {
            query["Sub-Category"] = { $regex: `.*${subCategory}.*`, $options: 'i' };
        }

        console.log("Constructed Query:", query);

        const totalRecord = await superStores.countDocuments(query);
        console.log("Total Records:", totalRecord);

        const data = await superStores.find(query)
            .skip((pageNo - 1) * parseInt(recordPerPage))
            .limit(parseInt(recordPerPage));
        console.log("Data Fetched:", data);

        res.json({
            data: data,
            totalRecord: totalRecord
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/deleteProduct/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const superStoresModel = mongoose.model("superstores", superStoresSchema.superStoresSchema);

        // Find and delete the product by ID
        const deletedProduct = await superStoresModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully", deletedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/addSuperStore', async (req, res) => {
    const params = req.body;
    const superstores = mongoose.model("superstores", superStoresSchema.superStoresSchema);
    const model = new superstores(params);

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


app.put('/updateSuperStore/:_id', async (req, res) => {
    const { _id } = req.params;
    const params = req.body;
    const superstores = mongoose.model("superstores", superStoresSchema.superStoresSchema);
    const result = await superstores.findByIdAndUpdate(_id,params);
    res.json({
        status_code: result ? 200 : 400,
    });
});

module.exports = app;
