import mongoose from "mongoose";
const schema = mongoose.Schema;
const productSchema = new schema({
    productName: {
        type: String,
        required: true,
        unique: true,
    },
    productPrice: {
        type: String,
        required: true,
    },
    productDescription: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: Date,
        required: true,
        default: Date.now
    }
})