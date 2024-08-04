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
      type: Number,
    },
    routingNumber: {
      type: Number,
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
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transfer", TransferSchema);
