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
  VerifyTac,
  CreateTac,
  CreateOtp,
  CreateCot,
  VerifyCot,
  CreateEmf,
  CreateImf,
  VerifyImf,
  VerifyEmf,
  UpdateAccountStatus,
  EditUser,
  UpdateTransferStatus,
} = require("../controller/user");
const router = express.Router();

router.route("/").get(getAllUser);
router.route("/getUser/:id").get(GetUser);
router.route("/edit-profile").patch(EditUser);
router.route("/register").post(CreateUser);
router.route("/login").post(Login);
router.route("/verify-pin").post(VerifyPin);
router.route("/change-password").patch(changePassword);
router.route("/verify/:id").post(VerifyOTP);
router.route("/verify-tac/:id").post(VerifyTac);
router.route("/create-tac").post(CreateTac);
router.route("/verify-cot/:id").post(VerifyCot);
router.route("/create-cot").post(CreateCot);
router.route("/verify-imf/:id").post(VerifyImf);
router.route("/create-imf").post(CreateImf);
router.route("/verify-emf/:id").post(VerifyEmf);
router.route("/create-emf").post(CreateEmf);
router.route("/create-otp").post(CreateOtp);
router.route("/change-transaction-pin/:id").patch(changeTransactionPin);
router.route("/add-profile-pics/:id").patch(uploadProfilePics);
router.route("/admin-login").post(AdminLogin);
router.route("/create-admin").post(CreateAdmin);
router.route("/update-account-status").patch(UpdateAccountStatus);
router.route("/update-transact-status").patch(UpdateTransferStatus);

module.exports = router;
