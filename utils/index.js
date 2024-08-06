const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
dotenv.config();

const APP_SECRET = process.env.APP_SECRET;
const ADMIN_APP_SECRET = process.env.ADMIN_APP_SECRET;
const EMAIL = process.env.USER_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

const HashPassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

const ValidatePassword = async (enteredPassword, savedPassword, salt) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

const GenerateSignature = async (payload) => {
  return jwt.sign(payload, APP_SECRET);
  // return jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
};

const GenerateAdminSignature = async (payload) => {
  return jwt.sign(payload, ADMIN_APP_SECRET);
  // return jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
};

const IsAuthenticated = async (req, res, next) => {
  // const token = req.Headers["Authorization"]?.split(" ")[1];
  const token = req.get("Authorization");
  if (!token) {
    res.status(403).send("Unauthorized user");
  }
  await jwt.verify(token.split(" ")[1], process.env.APP_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: err });
    } else {
      req.user = user;
      next();
    }
  });
};

const IsAdmin = async (req, res, next) => {
  // const token = req.Headers["Authorization"]?.split(" ")[1];
  const token = req.get("Authorization");
  if (!token) {
    res.status(403).send("Unauthorized user");
  }
  await jwt.verify(
    token.split(" ")[1],
    process.env.ADMIN_APP_SECRET,
    (err, user) => {
      if (err) {
        return res.status(401).json({ message: err });
      } else {
        req.user = user;
        next();
      }
    }
  );
};

function generateAccountNumber() {
  // Generate a 4-digit random number using the crypto module
  const randomBytes = crypto.randomBytes(2); // 2 bytes = 16 bits
  const randomNumber = parseInt(randomBytes.toString("hex"), 16) % 10000;

  // Add additional digits to ensure the number is 10 digits long
  const additionalDigits = 2; // Change this number as needed
  const timestamp = Date.now().toString().slice(-additionalDigits);
  const processId = process.pid.toString().slice(-additionalDigits);

  // Combine the random number with the additional digits to create a unique 10-digit number
  const uniqueNumber = `60${randomNumber}${timestamp}${processId}`;
  return uniqueNumber;
}

const GenerateOpt = async () => {
  const otp = await otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  // console.log(otp, "from otp it self");
  return otp;
};

const GenerateSixRandomDigits = () => {
  const otp = crypto.randomInt(100000, 1000000); // Generates a number between 100000 (inclusive) and 1000000 (exclusive)
  return otp;
};
const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: true,
      auth: {
        user: "elitetrustfinance1@gmail.com",
        pass: "jzrytaqcktpljreq",
      },
    });

    const sentMailResponse = await transporter.sendMail({
      from: "info@elitetrustfinance.online",
      to: email,
      subject: subject,
      html: text,
    });
    console.log("email sent sucessfully", sentMailResponse);
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};
function TrimMyDate(creadtedAt) {
  const createdAt = creadtedAt;
  const date = new Date(createdAt);
  const trimmedDate = date.toISOString().split("T")[0];
  console.log(trimmedDate);
  return trimmedDate;
}

// export default generateAccountNumber
module.exports = {
  generateAccountNumber,
  GenerateSalt,
  GenerateOpt,
  HashPassword,
  ValidatePassword,
  GenerateSignature,
  GenerateAdminSignature,
  IsAuthenticated,
  IsAdmin,
  sendEmail,
  TrimMyDate,
  GenerateSixRandomDigits,
};
