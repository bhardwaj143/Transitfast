// User Mapper
export const userMapper = async(userprops) => {
    // Remove password OTP
    let { password, otp, ...rest } = userprops._doc;
    return rest;
};
