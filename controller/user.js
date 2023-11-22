const UserSchema = require("../model/users");
const AdminSchema = require("../model/admin");
const { OtpMessageDisplay } = require("../utils/message.template");
const dotenv = require("dotenv");
const crypto = require("crypto");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
dotenv.config();
const {
  generateAccountNumber,
  GenerateSalt,
  GenerateSignature,
  GenerateAdminSignature,
  HashPassword,
  ValidatePassword,
  GenerateOpt,
  sendEmail,
} = require("../utils/index");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getMilliseconds() + file.originalname);
  },
});

const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const upload = multer({ storage: storage }).single("image");

async function uploadToCloudinary(locaFilePath) {
  var mainFolderName = "region-bank";
  var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
  return cloudinary.uploader
    .upload(locaFilePath)
    .then((result) => {
      fs.unlinkSync(locaFilePath);
      return {
        message: "Success",
        url: result.url,
      };
    })
    .catch((error) => {
      fs.unlinkSync(locaFilePath);
      return { message: "Fail" };
    });
}

const getAllUser = async (req, res) => {
  try {
    const users = await UserSchema.find({});
    res.status(200).json({ msg: users });
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const uploadProfilePics = async (req, res) => {
  const userId = req.params.id;
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
    } else {
      if (req.file) {
        var locaFilePath = req.file.path;
        var result = await uploadToCloudinary(locaFilePath);
        console.log(result);
        try {
          let user = await UserSchema.findOneAndUpdate(
            { _id: userId },
            { image: result.url }
          );
          return res.json({ msg: "Profile Pics Updated", user });
        } catch (err) {
          res.status(500).send(err);
        }
      }
    }
  });
};

const CreateUser = async (req, res) => {
  try {
    const userDetails = await req.body;
    console.log(userDetails);
    const finduser = await UserSchema.findOne({
      email: userDetails.email,
    });

    if (finduser) {
      return res.status(500).json({ msg: "user already exit" });
    } else {
      const salt = await GenerateSalt();
      // const Password = await HashPassword(userDetails.password, salt);

      // console.log(Password, "from password");
      const AccountNumber = await generateAccountNumber();
      console.log(AccountNumber);
      // const AccountNumber = 1234567890;
      console.log("got here");
      // let accountBalance =
      //   userDetails.checkingsBalance + userDetails.savingsBalance;
      const userData = await UserSchema.create({
        ...userDetails,
        accountNo: AccountNumber,
      });
      console.log("user data");
      console.log(userData);
      const token = await GenerateSignature({
        email: userData.email,
        _id: userData._id,
      });
      // console.log(userData);
      res.status(200).send({ data: userData, token: token });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

const Login = async (req, res) => {
  try {
    const { accountNo, password } = req.body;
    const userExists = await UserSchema.findOne({ accountNo: accountNo });
    console.log("dllsdklsdlkl");
    if (userExists) {
      // console.log("user exists", userExists);
      if (userExists.password === password) {
        console.log(userExists.password, password, "from password is correct");
        const newOtp = await GenerateOpt();
        console.log(newOtp, "from otp");
        // userExists.otp = otp;
        const message = `Your OTP Code is ${newOtp}`;

        const htmlMessage = OtpMessageDisplay(newOtp);
        const subject = "OTP Validation";
        // await sendEmail(userExists.email, subject, htmlMessage);
        // await userExists.save();
        // const userOtp = { otp: newOtp };
        // await userExists.updateOne(userOtp);
        const token = await GenerateSignature({
          email: userExists.email,
          _id: userExists._id,
        });
        console.log(token, "from token");
        res.status(200).json({
          msg: "login successful",
          email: userExists.email,
        });
      } else {
        res.status(400).send({ msg: "Invalid Credentials" });
      }
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const VerifyPin = async (req, res) => {
  try {
    const { email, transactionPin } = req.body;
    const userExists = await UserSchema.findOne({ email: email });
    console.log("dllsdklsdlkl");
    if (userExists) {
      console.log("user exists", userExists);
      if (userExists.transactionPin === transactionPin) {
        console.log(
          userExists.transactionPin,
          transactionPin,
          "from transaction pin is correct"
        );
        const newOtp = await GenerateOpt();
        console.log(newOtp, "from otp");
        // userExists.otp = otp;
        const message = `Your OTP Code is ${newOtp}`;

        const htmlMessage = OtpMessageDisplay(newOtp);
        const subject = "OTP Validation";
        // await sendEmail(userExists.email, subject, htmlMessage);
        // await userExists.save();
        // const userOtp = { otp: newOtp };
        // await userExists.updateOne(userOtp);
        const token = await GenerateSignature({
          email: userExists.email,
          _id: userExists._id,
        });
        console.log(token, "from token");
        res.status(200).json({
          msg: "login successful",
          credentials: { token: token, id: userExists._id },
        });
      } else {
        res.status(400).send({ msg: "Invalid Credentials" });
      }
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};
const VerifyOTP = async (req, res) => {
  try {
    const id = req.params.id;
    const { otp } = req.body;
    const userExists = await UserSchema.findById({ _id: id });
    if (userExists) {
      if (userExists.otp === otp) {
        const token = await GenerateSignature({
          email: userExists.email,
          _id: userExists._id,
        });
        res.status(200).json({
          msg: "OTP Verified",
          credentials: { token: token, id: userExists._id },
        });
      } else {
        res.status(400).send({ msg: "Invalid Credentials" });
      }
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const userExists = await UserSchema.findOne({ email: email });
    if (userExists) {
      userExists.password = newPassword;
      userExists.save();
      res.status(200).json("password updated");
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const EditUser = async (req, res) => {
  try {
    const {
      email,
      newPassword,
      newName,
      checkingsBalance,
      savingsBalance,
      transactionPin,
      address,
    } = req.body;
    const userExists = await UserSchema.findOne({ email: email });
    if (userExists) {
      newPassword
        ? (userExists.password = newPassword)
        : (userExists.password = userExists.password);
      newName
        ? (userExists.fullName = newName)
        : (userExists.fullName = userExists.fullName);
      checkingsBalance
        ? (userExists.checkingsBalance = checkingsBalance)
        : (userExists.checkingsBalance = userExists.checkingsBalance);
      savingsBalance
        ? (userExists.savingsBalance = savingsBalance)
        : (userExists.savingsBalance = userExists.savingsBalance);
      transactionPin
        ? (userExists.transactionPin = transactionPin)
        : (userExists.transactionPin = userExists.transactionPin);
      address
        ? (userExists.address = address)
        : (userExists.address = userExists.address);
      userExists.save();
      res.status(200).json("password updated");
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const changeTransactionPin = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPin } = req.body;
    const userExists = await UserSchema.findById({ _id: userId });
    if (userExists) {
      console.log(userExists);
      // userExists.password = newPassword;
      let user = await UserSchema.findOneAndUpdate(
        { _id: userId },
        { transactionPin: Number(newPin) }
      );
      // userExists.save();
      res.status(200).json("pin has been updated");
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const GetUser = async (req, res) => {
  try {
    const id = req.params.id;
    const getUser = await UserSchema.findById(id);
    console.log(getUser);
    res.status(200).json(getUser);
  } catch (err) {
    res.status(403).send({ msg: "can't get user" });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const getUser = await UserSchema.findByIdAndDelete(id);
    console.log(getUser);
    res.status(200).json(getUser);
  } catch (err) {
    res.status(403).send({ msg: "can't get user" });
  }
};

const CreateAdmin = async (req, res) => {
  try {
    const adminDetails = await req.body;
    console.log(adminDetails);
    const findAdmin = await AdminSchema.findOne({
      email: adminDetails.email,
    });

    if (findAdmin) {
      return res.status(500).json({ msg: "admin already exit" });
    } else {
      const salt = await GenerateSalt();
      const Password = await HashPassword(adminDetails.password, salt);

      console.log(Password, "from password");
      // const AccountNumber = 1234567890;
      console.log("got here");
      const adminData = await AdminSchema.create({
        ...adminDetails,
        password: Password,
      });
      console.log("user data");
      console.log(adminData);
      const token = await GenerateAdminSignature({
        email: adminData.email,
        _id: adminData._id,
      });
      // console.log(userData);
      res.status(200).json({ data: adminData, token: token });
    }
  } catch (err) {
    res.status(500).send({ msg: err.msg });
  }
};

const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminExists = await AdminSchema.findOne({ email: email });
    if (adminExists) {
      const isValidPassword = await ValidatePassword(
        password,
        adminExists.password
      );
      if (isValidPassword) {
        const token = await GenerateAdminSignature({
          email: adminExists.email,
          _id: adminExists._id,
        });
        res.status(200).json({ msg: "login successful", token: token });
      }
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};
module.exports = {
  getAllUser,
  CreateUser,
  Login,
  CreateAdmin,
  AdminLogin,
  GetUser,
  VerifyOTP,
  changePassword,
  uploadProfilePics,
  changeTransactionPin,
  DeleteUser,
  VerifyPin,
};
