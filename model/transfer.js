const { Schema, default: mongoose } = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const TransferSchema = new Schema(
  {
    senderId: {
      type: ObjectID,
      // required: true,
      // ref: "User",
    },
    sender: {
      type: String,
      required: true,
    },
    debitFrom: {
      type: String,
      default: "savings",
      enum: ["savings", "checkings"],
    },
    creditTo: {
      type: String,
      default: "savings",
      enum: ["savings", "checkings"],
    },
    amount: {
      type: Number,
      required: true,
    },
    receiverId: {
      type: ObjectID,
      ref: "User",
    },
    accountName: {
      type: String,
    },
    accountNo: {
      type: Number,
    },
    bankName: {
      type: String,
    },
    currency: {
      type: String,
      enum: ["USD", "GPD", "EUR", "JPY", "YER", "YUD", "AUD"],
    },
    switfCode: {
      type: String,
    },
    routingNumber: {
      type: String,
    },
    country: {
      type: String,
    },
    remark: {
      type: String,
    },
    senderBalance: {
      type: Number,
      // required: true,
    },
    ibanNumber: {
      type: String,
    },
    transactionStatus: {
      type: String,
      default: "completed",
      enum: ["pending", "failed", "completed"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transfer", TransferSchema);
