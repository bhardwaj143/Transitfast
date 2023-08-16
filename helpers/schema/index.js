import Joi from "joi";

// Validation Cases
export const validationSchema = (action) => {
  switch (action) {
    case "ADD_USER": {
      return {
        password: Joi.string().required(),
        email: Joi.string().required()
      };
    }
    case "LOGIN": {
      return {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      };
    }
    case "CHANGE_PASSWORD": {
      return {
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
      };
    }
    case "RESET_PASSWORD": {
      return {
        password: Joi.string().required(),
        email: Joi.string().email().required(),
      };
    }
    case "FORGET_PASSWORD": {
      return {
        email: Joi.string().email().required(),
      };
    }
    case "VERIFY_OTP": {
      return {
        otp: Joi.number().required(),
        email: Joi.string().email().required(),
      };
    }
  }
  return {};
};
