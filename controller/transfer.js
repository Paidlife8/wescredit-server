const TransferSchema = require("../model/transfer");
const UserSchema = require("../model/users");
const { sendEmail, TrimMyDate } = require("../utils/index");
const {
  transactionMessageDisplay,
  transactionCreditMessageDisplay,
} = require("../utils/message.template");

const CreateTransfer = async (req, res) => {
  try {
    const transferDetails = req.body;
    const senderId = req.user._id;
    const validAccountNumber = await UserSchema.findOne({
      accountNo: transferDetails.accountNo,
    });
    // const otherAccountNumber =
    console.log(
      String(transferDetails.accountNo).length,
      "transfer details acount"
    );
    if (validAccountNumber) {
      const getSender = await UserSchema.findById({ _id: senderId });
      if (getSender.transactionPin === transferDetails.transactionPin) {
        if (
          transferDetails.debitFrom === "checkings" &&
          getSender.enableTransfer === true
        ) {
          const senderCheckingBalance =
            getSender.checkingsBalance - transferDetails.amount;
          const senderAccountBalance =
            getSender.accountBalance - transferDetails.amount;
          const senderName = await getSender.fullName;
          console.log(senderName);
          const createTransfer = await TransferSchema.create({
            ...transferDetails,
            accountName: validAccountNumber.fullName,
            sender: senderName,
            senderId: senderId,
            receiverId: validAccountNumber._id,
            senderBalance: senderCheckingBalance,
          });
          const updateSenderBalance = {
            checkingsBalance: senderCheckingBalance,
            accountBalance: senderAccountBalance,
          };
          await getSender.updateOne(updateSenderBalance);
          const justDate = TrimMyDate(createTransfer.createdAt);
          // console.log(justDate, "from just date");

          const htmlDebitMessage = transactionMessageDisplay({
            moneySent: transferDetails.amount,
            accountDebited: getSender.accountNo,
            accountCredited: transferDetails.accountNo,
            accountName: validAccountNumber.fullName,
            description: transferDetails.remark,
            date: justDate,
            availableBalance: getSender.accountBalance,
            totalBalance: senderAccountBalance,
          });

          const debitSubject = "Debit Alert";
          await sendEmail(getSender.email, debitSubject, htmlDebitMessage);

          const newAccountBalance =
            transferDetails.creditTo === "checkings"
              ? {
                  savingsBalance: validAccountNumber.savingsBalance,
                  checkingsBalance:
                    createTransfer.amount + validAccountNumber.checkingsBalance,
                  accountBalance:
                    createTransfer.amount + validAccountNumber.accountBalance,
                }
              : transferDetails.creditTo === "savings"
              ? {
                  savingsBalance:
                    createTransfer.amount + validAccountNumber.savingsBalance,
                  checkingsBalance: validAccountNumber.checkingsBalance,
                  accountBalance:
                    createTransfer.amount + validAccountNumber.accountBalance,
                }
              : {
                  savingsBalance:
                    createTransfer.amount + validAccountNumber.savingsBalance,
                  checkingsBalance: validAccountNumber.checkingsBalance,
                  accountBalance:
                    createTransfer.amount + validAccountNumber.accountBalance,
                };
          // const updateAccountBalance = { accountBalance: newAccountBalance };

          await validAccountNumber.updateOne(newAccountBalance);

          const htmlCreditMessage = transactionMessageDisplay({
            moneySent: transferDetails.amount,
            accountDebited: getSender.accountNo,
            accountCredited: transferDetails.accountNo,
            accountName: validAccountNumber.fullName,
            description: transferDetails.remark,
            date: justDate,
            availableBalance: validAccountNumber.accountBalance,
            totalBalance: newAccountBalance.accountBalance,
          });
          const creditSubject = "Credit Alert";
          await sendEmail(
            validAccountNumber.email,
            creditSubject,
            htmlCreditMessage
          );
          console.log(newAccountBalance);
          res
            .status(200)
            .json({ msg: "Transfer Successful", content: createTransfer });
        } else if (
          transferDetails.debitFrom === "savings" &&
          getSender.enableTransfer === true
        ) {
          const senderSavingBalance =
            getSender.savingsBalance - transferDetails.amount;
          console.log(senderSavingBalance, "sender savings balance");
          const senderAccountBalance =
            getSender.accountBalance - transferDetails.amount;
          console.log(senderAccountBalance, "account balance");
          const senderName = await getSender.fullName;

          const createTransfer = await TransferSchema.create({
            ...transferDetails,
            accountName: validAccountNumber.fullName,
            sender: senderName,
            senderId: senderId,
            receiverId: validAccountNumber._id,
            senderBalance: senderSavingBalance,
          });
          // const updateAccountingBalance = await UserSchema.findByIdAndUpdate({
          //   _id: senderId,
          //   updateSenderBalance,
          // });
          const updateSenderBalance = {
            savingsBalance: senderSavingBalance,
            accountBalance: senderAccountBalance,
          };

          await getSender.updateOne(updateSenderBalance);
          // const updateDone = await getSender.updateOne(updateSenderBalance);
          const justDate = TrimMyDate(createTransfer.createdAt);

          const htmlDebitMessage = transactionMessageDisplay({
            moneySent: transferDetails.amount,
            accountDebited: getSender.accountNo,
            accountCredited: transferDetails.accountNo,
            accountName: validAccountNumber.fullName,
            description: transferDetails.remark,
            date: justDate,
            availableBalance: getSender.accountBalance,
            totalBalance: senderAccountBalance,
          });

          const debitSubject = "Debit Alert";
          await sendEmail(getSender.email, debitSubject, htmlDebitMessage);
          // let updateAccountBalance;
          const newAccountBalance =
            transferDetails.creditTo === "checkings"
              ? {
                  checkingsBalance:
                    createTransfer.amount + validAccountNumber.checkingsBalance,
                  accountBalance:
                    createTransfer.amount + validAccountNumber.accountBalance,
                }
              : transferDetails.creditTo === "savings"
              ? {
                  savingsBalance:
                    createTransfer.amount + validAccountNumber.savingsBalance,
                  accountBalance:
                    createTransfer.amount + validAccountNumber.accountBalance,
                }
              : {
                  savingsBalance:
                    createTransfer.amount + validAccountNumber.savingsBalance,
                  accountBalance:
                    createTransfer.amount + validAccountNumber.accountBalance,
                };
          // const updateAccountBalance = { accountBalance: newAccountBalance,  };
          // console.log(updateAccountBalance);
          await validAccountNumber.updateOne(newAccountBalance);

          const htmlCreditMessage = transactionCreditMessageDisplay({
            moneySent: transferDetails.amount,
            accountDebited: getSender.accountNo,
            accountCredited: transferDetails.accountNo,
            accountName: validAccountNumber.fullName,
            description: transferDetails.remark,
            date: justDate,
            availableBalance: validAccountNumber.accountBalance,
            totalBalance: newAccountBalance.accountBalance,
          });
          const creditSubject = "Credit Alert";
          await sendEmail(
            validAccountNumber.email,
            creditSubject,
            htmlCreditMessage
          );
          res
            .status(200)
            .json({ msg: "Transfer Successful", content: createTransfer });
        } else if (getSender.enableTransfer === false) {
          res.status(303).send({ msg: "Can't transfer, wrong location" });
        } else {
          res.status(303).send({ msg: "Insufficient funds" });
        }
      } else {
        res.status(303).send({ msg: "Incorrect pin" });
      }
    } else if (String(transferDetails.accountNo).length == 10) {
      const getSender = await UserSchema.findById({ _id: senderId });
      if (getSender.transactionPin === transferDetails.transactionPin) {
        if (
          transferDetails.debitFrom === "checkings" &&
          getSender.enableTransfer === true
        ) {
          const senderCheckingBalance =
            getSender.checkingsBalance - transferDetails.amount;
          const senderAccountBalance =
            getSender.accountBalance - transferDetails.amount;
          const senderName = await getSender.fullName;
          console.log(senderName, senderId, "ffrom getting sender");
          const createTransfer = await TransferSchema.create({
            ...transferDetails,
            accountName: transferDetails.fullName,
            sender: senderName,
            senderId: senderId,
            receiverId: senderId,
            senderBalance: senderCheckingBalance,
          });
          console.log(createTransfer, "create transfer");
          const updateSenderBalance = {
            checkingsBalance: senderCheckingBalance,
            accountBalance: senderAccountBalance,
          };
          await getSender.updateOne(updateSenderBalance);

          const htmlMessage = transactionMessageDisplay({
            moneySent: transferDetails.amount,
            accountDebited: getSender.accountNo,
            accountCredited: transferDetails.accountNo,
            accountName: transferDetails.accountName,
            description: transferDetails.remark,
            date: justDate,
            availableBalance: getSender.accountBalance,
            totalBalance: senderAccountBalance,
          });

          const subject = "Debit Alert";
          await sendEmail(getSender.email, subject, htmlMessage);
          // const updateAccountBalance = { accountBalance: newAccountBalance };
          // await validAccountNumber.updateOne(updateAccountBalance);
          res
            .status(200)
            .json({ msg: "Transfer Successful", content: createTransfer });
        } else if (
          transferDetails.debitFrom === "savings" &&
          getSender.enableTransfer === true
        ) {
          const senderSavingBalance =
            getSender.savingsBalance - transferDetails.amount;
          const senderAccountBalance =
            getSender.accountBalance - transferDetails.amount;
          const senderName = await getSender.fullName;
          console.log(senderName);
          const createTransfer = await TransferSchema.create({
            ...transferDetails,
            accountName: validAccountNumber.fullName,
            sender: senderName,
            senderId: senderId,
            receiverId: validAccountNumber._id,
            senderBalance: senderSavingBalance,
          });
          const updateSenderBalance = {
            savingsBalance: senderSavingBalance,
            accountBalance: senderAccountBalance,
          };
          await getSender.updateOne(updateSenderBalance);

          const htmlMessage = transactionMessageDisplay({
            moneySent: transferDetails.amount,
            accountDebited: getSender.accountNo,
            accountCredited: transferDetails.accountNo,
            accountName: transferDetails.accountName,
            description: transferDetails.remark,
            date: justDate,
            availableBalance: getSender.accountBalance,
            totalBalance: senderAccountBalance,
          });

          const subject = "Debit Alert";
          await sendEmail(getSender.email, subject, htmlMessage);

          res
            .status(200)
            .json({ msg: "Transfer Successful", content: createTransfer });
        } else if (getSender.enableTransfer === false) {
          res.status(303).send({ msg: "Can't transfer, wrong location" });
        } else {
          res.status(303).send({ msg: "Insufficient funds" });
        }
      } else {
        res.status(303).send({ msg: "Incorrect pin" });
      }
    } else {
      res.status(404).send({ msg: "Invalid Account" });
    }
  } catch (err) {
    res.status(500).send(err.msg);
  }
};

const InterStateTransfer = async (req, res) => {
  try {
    const transferDetails = req.body;
    const senderId = req.user._id;
    const validAccountNumber = await UserSchema.findOne({
      accountNo: transferDetails.accountNo,
    });
    // const otherAccountNumber =
    console.log(
      String(transferDetails.accountNo).length,
      "transfer details acount"
    );
    if (validAccountNumber) {
      const getSender = await UserSchema.findById({ _id: senderId });
      if (getSender.accountBalance > transferDetails.amount) {
        const senderAccountBalance =
          getSender.accountBalance - transferDetails.amount;
        const updateSenderBalance = {
          accountBalance: senderAccountBalance,
        };

        const receiverAccountBalance = {
          accountBalance:
            validAccountNumber.accountBalance + Number(transferDetails.amount),
        };
        await getSender.updateOne(updateSenderBalance);

        await validAccountNumber.updateOne(receiverAccountBalance);
        const createTransfer = await TransferSchema.create({
          ...transferDetails,
          accountName:
            validAccountNumber.firstName + " " + validAccountNumber.lastName,
          sender: getSender.firstName + " " + getSender.lastName,
          senderId: getSender._id,
          receiverId: validAccountNumber._id,
          senderBalance: senderAccountBalance,
        });
        res
          .status(200)
          .send({ msg: "transferred successfully", receipt: createTransfer });
      } else {
        res.status(400).send({ msg: "insufficient funds" });
      }
    } else if (String(transferDetails.accountNo).length == 10) {
      const getSender = await UserSchema.findById({ _id: senderId });
      if (getSender.accountBalance > transferDetails.amount) {
        const senderAccountBalance =
          getSender.accountBalance - transferDetails.amount;
        const updateSenderBalance = {
          accountBalance: senderAccountBalance,
        };

        await getSender.updateOne(updateSenderBalance);
        const createTransfer = await TransferSchema.create({
          ...transferDetails,
          sender: getSender.firstName + " " + getSender.lastName,
          senderId: getSender._id,
          senderBalance: senderAccountBalance,
        });
        res.status(200).send({ msg: "success", receipt: createTransfer });
      } else {
        res.status(400).send({ msg: "insufficient funds" });
      }
    } else {
      res.status(404).send({ msg: "Invalid Account" });
    }
  } catch (err) {
    res.status(500).send(err.msg);
  }
};

const GetAccountNo = async (req, res) => {
  try {
    const accountNo = req.params.accountNo;
    const validAccountNumber = await UserSchema.findOne({
      accountNo: accountNo,
    });
    if (validAccountNumber) {
      res.status(200).send({ accountName: validAccountNumber.fullName });
    } else {
      res.status(404).send({ msg: "Invalid Account Number" });
    }
  } catch (err) {
    res.status(500).send({ msg: err });
  }
};

const DisableTransfer = async (req, res) => {
  try {
    const id = req.params.id;
    const disAbleTransfer = { enableTransfer: false };
    const findAndUpdate = await UserSchema.findByIdAndUpdate(
      { _id: id },
      disAbleTransfer
    );
    console.log(findAndUpdate);
    res.status(200).send({ msg: "Transfer Disabled", account: findAndUpdate });
  } catch (err) {
    res.status(500).send(err.msg);
  }
};

const EnableTransfer = async (req, res) => {
  try {
    const id = req.params.id;
    const enableTransfer = { enableTransfer: true };
    const findAndUpdate = await UserSchema.findByIdAndUpdate(
      { _id: id },
      enableTransfer
    );
    console.log(findAndUpdate);
    res.status(200).send({ msg: "Transfer Disabled", account: findAndUpdate });
  } catch (err) {
    res.status(500).send(err.msg);
  }
};

const ChangeUserAccountStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { accountStatus } = req.body;
    const enableTransfer = { accountStatus: accountStatus };
    const findAndUpdate = await UserSchema.findByIdAndUpdate(
      { _id: id },
      enableTransfer
    );
    console.log(findAndUpdate);
    res.status(200).send({ msg: "Transfer Disabled", account: findAndUpdate });
  } catch (err) {
    res.status(500).send(err.msg);
  }
};

const AdminCreditUser = async (req, res) => {
  try {
    const transferDetails = req.body;
    const validAccountNumber = await UserSchema.findOne({
      accountNo: transferDetails.accountNo,
    });
    if (validAccountNumber) {
      const createTransfer = await TransferSchema.create({
        ...transferDetails,
        accountName: validAccountNumber.fullName,
      });
      const newAccountBalance =
        createTransfer.amount + validAccountNumber.accountBalance;
      const updateAccountBalance = { accountBalance: newAccountBalance };
      await validAccountNumber.updateOne(updateAccountBalance);
      res.status(204).send({ msg: "account credited successfully" });
    } else {
      res.status(404).send({ msg: "invalid account number" });
    }
  } catch (err) {
    res.status(500).send({ msg: err.msg });
  }
};

const AdminDebitUser = async (req, res) => {
  try {
    const transferDetails = req.body;
    const validAccountNumber = await UserSchema.findOne({
      accountNo: transferDetails.accountNo,
    });
    if (validAccountNumber) {
      const createTransfer = await TransferSchema.create({
        ...transferDetails,
        accountName: validAccountNumber.fullName,
      });
      const newAccountBalance =
        validAccountNumber.accountBalance - createTransfer.amount;
      const updateAccountBalance = { accountBalance: newAccountBalance };
      await validAccountNumber.updateOne(updateAccountBalance);
      res.status(204).send({ msg: "account credited successfully" });
    } else {
      res.status(404).send({ msg: "invalid account number" });
    }
  } catch (err) {
    res.status(500).send({ msg: err.msg });
  }
};

const GetTransactions = async (req, res) => {
  try {
    const transactions = await TransferSchema.find({});
    res.status(200).send({ msg: transactions });
  } catch (err) {
    res.status(500).send({ msg: err.msg });
  }
};

const GetUserTransactions = async (req, res) => {
  try {
    const id = req.params.id;
    const transactions = await TransferSchema.find({ senderId: id });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).send({ msg: err.msg });
  }
};
module.exports = {
  CreateTransfer,
  DisableTransfer,
  AdminCreditUser,
  AdminDebitUser,
  EnableTransfer,
  GetTransactions,
  GetUserTransactions,
  GetAccountNo,
  InterStateTransfer,
  ChangeUserAccountStatus,
};
