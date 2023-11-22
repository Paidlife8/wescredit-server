const express = require("express");
const {
  CreateTransfer,
  AdminCreditUser,
  AdminDebitUser,
  DisableTransfer,
  EnableTransfer,
  GetTransactions,
  GetUserTransactions,
  GetAccountNo,
  InterStateTransfer,
} = require("../controller/transfer");
const { IsAuthenticated, IsAdmin } = require("../utils");
// const { isAuthenticated } = require("../utils/index");
// const router = express.Router();
const router = express.Router();
// router.route("/credit").post(isAuthenticated, CreateTransfer);
router.route("/credit").post(IsAuthenticated, CreateTransfer);
router.route("/create-transfer").post(IsAuthenticated, InterStateTransfer);
router
  .route("/user-transactions/:id")
  .get(IsAuthenticated, GetUserTransactions);
router.route("/get-account/:accountNo").get(IsAuthenticated, GetAccountNo);
router.route("/all-transactions").get(IsAdmin, GetTransactions);
router.route("/admin-credit").post(IsAdmin, AdminCreditUser);
router.route("/admin-debit").post(IsAdmin, AdminDebitUser);
router.route("/disable-transfer/:id").patch(IsAdmin, DisableTransfer);
router.route("/enable-transfer/:id").patch(IsAdmin, EnableTransfer);
module.exports = router;
