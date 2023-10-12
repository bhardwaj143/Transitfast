import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import config from "config";

const adminSchema = mongoose.Schema({
    profile_pic: {
        type: String,
        required: false
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    fullName: {
        type: String,
        required: false
    },
    jobTitle: {
        type: String,
        required: false
    },
    dealershipName: {
        type: String,
        required: false
    },
    phoneNo: {
        type: Number,
        required: false
    },
    website: {
        type: String,
        required: false
    },
    vatNumber: {
        type: Number,
        required: false
    },
    companyRegistration: {
        type: String,
        required: false
    },
    address_1: {
        type: String,
        required: false
    },
    address_2: {
        type: String,
        required: false
    },
    city_town: {
        type: String,
        required: true
    },
    post_code: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: false
    },
    isApproved: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECT'],
        default: 'PENDING'
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: false
    },

}, {
    timestamps: true
}
);

adminSchema.methods.generateAuthToken = function (_id) {
    return jwt.sign({ id: _id, role: 'admin' }, config.get("privateKey"), { expiresIn: '15d' });
};

adminSchema.methods.generateRefershToken = function (_id) {
    return jwt.sign({ id: _id, role: 'admin' }, config.get("privateKey"), { expiresIn: '30d' });
};

const Admins = mongoose.model('Admins', adminSchema);

export { Admins };
