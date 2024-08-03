const { Schema, default: mongoose } = require("mongoose");

const UserSchema = new Schema(
  {
    firstName: {
      required: true,
      type: String,
    },
    lastName: {
      required: true,
      type: String,
    },
    userName: {
      required: true,
      type: String,
    },
    image: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    email: {
      required: true,
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
    },
    otp: {
      type: String,
    },
    tac: {
      type: Number,
    },
    cot: {
      type: String,
    },
    imf: {
      type: String,
    },
    emf: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    accountNo: {
      type: Number,
      required: true,
    },
    checkingsBalance: {
      type: Number,
      default: 0,
    },
    accountType: {
      type: String,
      default: "saving",
    },
    savingsBalance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    transactionPin: {
      type: Number,
      required: true,
    },
    enableTransfer: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      default: "active",
      // enum: ["active", "wrong location", "blocked"],
    },
    zipcode: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", UserSchema);
