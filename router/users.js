const express = require("express");
const {
  getAllUser,
  CreateUser,
  GetUser,
  Login,
  AdminLogin,
  CreateAdmin,
  uploadProfilePics,
  changePassword,
  VerifyOTP,
  changeTransactionPin,
  VerifyPin,
} = require("../controller/user");
const router = express.Router();

router.route("/").get(getAllUser);
router.route("/getUser/:id").get(GetUser);
router.route("/register").post(CreateUser);
router.route("/login").post(Login);
router.route("/verify-pin").post(VerifyPin);
router.route("/change-password").patch(changePassword);
router.route("/verify/:id").post(VerifyOTP);
router.route("/change-transaction-pin/:id").patch(changeTransactionPin);
router.route("/add-profile-pics/:id").patch(uploadProfilePics);
router.route("/admin-login").post(AdminLogin);
router.route("/create-admin").post(CreateAdmin);

module.exports = router;
