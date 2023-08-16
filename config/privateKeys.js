import dotenv from "dotenv";
dotenv.config();

let {
  DB_STRING,
  DB_STRING_DEV,
  PORT,
  nodemailerEmail,
  nodemailerPassword,
  SID,
  ACCOUNT_SID,
  AUTH_TOKEN,
  FAST2SMS_APIKEY,
} = process.env;

export const privateKey = {
  DB_STRING: DB_STRING,
  DB_STRING_DEV: DB_STRING_DEV,
  PORT: PORT,
  EMAIL: nodemailerEmail,
  PASSWORD: nodemailerPassword,
  TWIILIO_SID: SID,
  TWILIO_ACCOUNT_SID: ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: AUTH_TOKEN,
  TWILIO_PHONE: "+14067196662",
  FAST2SMS_APIKEY: FAST2SMS_APIKEY,
};
