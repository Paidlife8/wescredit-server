const UserSchema = require("../model/users");
const AdminSchema = require("../model/admin");
const {
  OtpMessageDisplay,
  welcomeMessage,
} = require("../utils/message.template");
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
  GenerateSixRandomDigits,
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

async function uploadToCloudinary(data) {
  var mainFolderName = "region-bank";
  // var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
  // return cloudinary.uploader
  //   .upload(locaFilePath)
  //   .then((result) => {
  //     fs.unlinkSync(locaFilePath);
  //     return {
  //       message: "Success",
  //       url: result.url,
  //     };
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     fs.unlinkSync(locaFilePath);
  //     return { message: "Fail" };
  //   });
  // let filePathOnCloudinary = mainFolderName + "/" + data;
  const uploadCheck = await cloudinary.uploader
    .upload(data, {
      folder: "global-link",
    })
    .then((result) => {
      fs.unlinkSync(data);
      return {
        message: "success",
        url: result.url,
      };
    })
    .catch((error) => {
      fs.unlinkSync(data);
      return { message: "fail" };
    });
  return uploadCheck;
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
        console.log(locaFilePath);
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
      console.log(
        userData,
        {
          pin: userData.transactionPin,
          userName: userData.userName,
          password: userData.password,
          accountNumber: userData.accountNo,
        },
        "user data"
      );
      const htmlMessage = welcomeMessage({
        pin: userData.transactionPin,
        userName: userData.userName,
        password: userData.password,
        accountNumber: userData.accountNo,
      });
      const subject = "Welcome to First Credit Choice";
      await sendEmail(userData.email, subject, htmlMessage);
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
    const { accountNo, password, transactionPin } = req.body;
    const userExists = await UserSchema.findOne({
      accountNo: Number(accountNo),
    });
    console.log("dllsdklsdlkl");
    if (userExists) {
      // console.log("user exists", userExists);
      if (
        userExists.password === password &&
        userExists.transactionPin === Number(transactionPin)
      ) {
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
          token: token,
          userId: userExists._id,
          userStatus: userExists.accountStatus,
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
      accountBalance,
      accountStatus,
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
      accountBalance
        ? (userExists.accountBalance = accountBalance)
        : (userExists.accountBalance = userExists.accountBalance);
      accountStatus
        ? (userExists.accountStatus = accountStatus)
        : (userExists.accountStatus = userExists.accountStatus);
      userExists.save();
      res.status(200).json("updated");
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const UpdateAccountStatus = async (req, res) => {
  try {
    const { accountStatus, email } = req.body;
    const userExists = await UserSchema.findOne({ email: email });
    if (userExists) {
      accountStatus
        ? (userExists.accountStatus = accountStatus)
        : (userExists.accountStatus = userExists.accountStatus);
      userExists.save();
      res.status(200).json("updated");
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.msg });
  }
};

const UpdateTransferStatus = async (req, res) => {
  try {
    const { transactStatus, email } = req.body;

    console.log(transactStatus, email, "req bodies");
    const userExists = await UserSchema.findOne({ email: email });
    if (userExists) {
      console.log(userExists, "user exists");
      transactStatus
        ? (userExists.transactStatus = transactStatus)
        : (userExists.transactStatus = userExists.transactStatus);
      userExists.save();
      res.status(200).json("updated");
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

const CreateOtp = async (req, res) => {
  try {
    const { accountNo } = req.body;
    const userExists = await UserSchema.findOne({ accountNo: accountNo });
    console.log("dllsdklsdlkl");
    if (userExists) {
      // console.log("user exists", userExists);
      const newTac = await GenerateOpt();
      console.log(newTac, "from otp");
      // userExists.otp = otp;
      // const message = `Your OTP Code is ${newOtp}`;

      const htmlMessage = OtpMessageDisplay({
        otpCode: newTac,
        userName: userExists.firstName,
        codeType: "OTP Code",
      });
      const subject = "OTP Validation";
      await sendEmail(userExists.email, subject, htmlMessage);
      // await userExists.save();
      const userOtp = { otp: newTac };
      await userExists.updateOne(userOtp);

      // console.log(token, "from token");
      res.status(200).json({
        msg: "otp sent successfully",
      });
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    console.log(err);
  }
};

const CreateTac = async (req, res) => {
  try {
    const { accountNo } = req.body;
    const userExists = await UserSchema.findOne({ accountNo: accountNo });
    console.log("dllsdklsdlkl");
    if (userExists) {
      // console.log("user exists", userExists);
      const newTac = await GenerateSixRandomDigits();
      console.log(newTac, "from otp");
      // userExists.otp = otp;
      const htmlMessage = OtpMessageDisplay({
        otpCode: newTac,
        userName: userExists.firstName,
        codeType: "TAC Code",
      });
      const subject = "TAC Validation";
      await sendEmail(userExists.email, subject, htmlMessage);
      // await userExists.save();
      const userOtp = { tac: newTac };
      await userExists.updateOne(userOtp);

      // console.log(token, "from token");
      res.status(200).json({
        msg: "tac sent successfully",
      });
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    console.log(err);
  }
};

const CreateCot = async (req, res) => {
  try {
    const { accountNo } = req.body;
    const userExists = await UserSchema.findOne({ accountNo: accountNo });
    console.log("dllsdklsdlkl");
    if (userExists) {
      // console.log("user exists", userExists);
      const newTac = await GenerateSixRandomDigits();
      console.log(newTac, "from otp");
      const htmlMessage = OtpMessageDisplay({
        otpCode: newTac,
        userName: userExists.firstName,
        codeType: "COT Code",
      });
      const subject = "COT Validation";
      await sendEmail(userExists.email, subject, htmlMessage);
      // await userExists.save();
      const userOtp = { cot: newTac };
      await userExists.updateOne(userOtp);

      // console.log(token, "from token");
      res.status(200).json({
        msg: "COT sent successfully",
      });
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    console.log(err);
  }
};

const CreateImf = async (req, res) => {
  try {
    const { accountNo } = req.body;
    const userExists = await UserSchema.findOne({ accountNo: accountNo });
    console.log("dllsdklsdlkl");
    if (userExists) {
      // console.log("user exists", userExists);
      const newTac = await GenerateSixRandomDigits();
      console.log(newTac, "from otp");
      const htmlMessage = OtpMessageDisplay({
        otpCode: newTac,
        userName: userExists.firstName,
        codeType: "IMF Code",
      });
      const subject = "IMF Validation";
      await sendEmail(userExists.email, subject, htmlMessage);
      // await userExists.save();
      const userOtp = { imf: newTac };
      await userExists.updateOne(userOtp);

      // console.log(token, "from token");
      res.status(200).json({
        msg: "IMF sent successfully",
      });
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    console.log(err);
  }
};

const CreateEmf = async (req, res) => {
  try {
    const { accountNo } = req.body;
    const userExists = await UserSchema.findOne({ accountNo: accountNo });
    console.log("dllsdklsdlkl");
    if (userExists) {
      // console.log("user exists", userExists);
      const newTac = await GenerateSixRandomDigits();
      console.log(newTac, "from otp");
      const htmlMessage = OtpMessageDisplay({
        otpCode: newTac,
        userName: userExists.firstName,
        codeType: "EMF Code",
      });
      const subject = "EMF Validation";
      await sendEmail(
        [userExists.email, "zealousemmy12@gmail.com"],
        subject,
        htmlMessage
      );
      // await userExists.save();
      const userOtp = { emf: newTac };
      await userExists.updateOne(userOtp);

      // console.log(token, "from token");
      res.status(200).json({
        msg: "EMF sent successfully",
      });
    } else {
      res.status(400).send({ msg: "USER NOT FOUND" });
    }
  } catch (err) {
    console.log(err);
  }
};

const VerifyTac = async (req, res) => {
  try {
    const id = req.params.id;
    const { tac } = req.body;
    const userExists = await UserSchema.findById({ _id: id });
    if (userExists) {
      console.log(userExists, "user already exists");
      if (userExists.tac === tac) {
        // const token = await GenerateSignature({
        //   email: userExists.email,
        //   _id: userExists._id,
        // });
        res.status(200).json({
          msg: "Tac Verified",
          id: userExists._id,
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

const VerifyCot = async (req, res) => {
  try {
    const id = req.params.id;
    const { cot } = req.body;
    const userExists = await UserSchema.findById({ _id: id });
    if (userExists) {
      console.log(userExists, "user already exists");
      if (userExists.cot === cot) {
        // const token = await GenerateSignature({
        //   email: userExists.email,
        //   _id: userExists._id,
        // });
        res.status(200).json({
          msg: "Cot Verified",
          id: userExists._id,
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

const VerifyImf = async (req, res) => {
  try {
    const id = req.params.id;
    const { imf } = req.body;
    const userExists = await UserSchema.findById({ _id: id });
    if (userExists) {
      console.log(userExists, "user already exists");
      if (userExists.imf === imf) {
        // const token = await GenerateSignature({
        //   email: userExists.email,
        //   _id: userExists._id,
        // });
        res.status(200).json({
          msg: "IMF Verified",
          id: userExists._id,
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

const VerifyEmf = async (req, res) => {
  try {
    const id = req.params.id;
    const { emf } = req.body;
    const userExists = await UserSchema.findById({ _id: id });
    if (userExists) {
      console.log(userExists, "user already exists");
      if (userExists.emf === emf) {
        // const token = await GenerateSignature({
        //   email: userExists.email,
        //   _id: userExists._id,
        // });
        res.status(200).json({
          msg: "EMF Verified",
          id: userExists._id,
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
  CreateTac,
  VerifyTac,
  CreateOtp,
  CreateCot,
  VerifyCot,
  CreateEmf,
  CreateImf,
  VerifyImf,
  VerifyEmf,
  EditUser,
  UpdateAccountStatus,
  UpdateTransferStatus,
};
