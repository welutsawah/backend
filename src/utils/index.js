const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET;

// utilty function
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.headers.authorization;
    const payload = await jwt.verify(signature.split(" ")[1], JWT_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data, status: "ok" };
  } else {
    throw new Error("Data Not Found!");
  }
};

module.exports.DecodeSignature = async (req) => {
  try {
    const signature = req?.headers?.authorization?.split(" ")[1];
    const payload = await jwt.decode(signature);
    return payload;
  } catch (error) {
    return error;
  }
};

module.exports.GenerateUniqueCode = () => {
  const prefix = "SVNRMRHBWI";
  const randomNumber = Math.floor(Math.random() * 100000);
  const uniqueCode = `${prefix}${randomNumber}`;
  return uniqueCode;
};

module.exports.IsValidDataURI = (str) => {
  const dataURIPattern =
    /^data:[\w+.-]+\/[\w+.-]+(;[\w+.-]+=[\w+.-]+)*;base64,([a-zA-Z0-9+/]+={0,2})$/;
  return dataURIPattern.test(str);
};
