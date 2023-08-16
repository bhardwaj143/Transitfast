import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const { sign, verify } = jsonwebtoken;
const { hash, compare } = bcrypt;

export const hashPassword = async (rawPassword) =>
  new Promise((resolve, reject) => {
    hash(rawPassword, 10).then(resolve).catch(reject);
  });

export const matchPassword = async (raw, encrypted) =>
  new Promise((resolve, reject) => {
    compare(raw, encrypted).then(resolve).catch(reject);
  });

export const assignToken = (payload, secret) => {
  return sign(payload, secret);
};

// Verify Token
export const verifyToken = async (payload, secret) => {
  return await verify(payload, secret);
};

export function generateOtp() {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(OTP);
  return OTP;
}
