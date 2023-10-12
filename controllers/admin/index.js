import Router from 'express';
import { privateKey } from '../../config/privateKeys.js'
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import {
    hashPassword,
    findByEmail,
    matchPassword,
    updateAdmin,
    sendEmail,
    generateOtp,
    findAdmin,
    addAdmin,
    updateAdminProfile,
    findAllVehicles,
    getVehiclesCount,
    findAllAdmins,
    getAdminsCount,
    updateAdminBySuperAdmin,
    findAllFilteredVehicles
} from '../../services/index.js';
import { validators } from '../../middleware/index.js';
import upload from '../../middleware/upload/index.js';
import adminAuth from '../../middleware/auth/admin.js';
import { userMapper } from '../../helpers/mapper/index.js';

//Response messages
const { LOGIN, OTP_MISMATCH, INVALID_PASSWORD, INVALID, PASSWORD_CHANGED, ADMIN_ADDED, USER_NOTFOUND, RESET_PASSWORD, OTP_FOR_PASSWORD, VERIFY_OTP, EMAIL_NOT_REGISTER, ALREADY_EXIST, UPDATE_PROFILE, FETCH_ALL_VEHICLE, FETCH_ALL_ADMIN, APPROVED } = responseMessages;
//Response Status code
const { SUCCESS, NOT_FOUND, BAD_REQUEST, RECORD_ALREADY_EXISTS } = statusCodes;

const router = Router();

//Refresh token
router.post('/refresh-token', validators('REFRESH_TOKEN'), catchAsyncAction(async (req, res) => {
    let decod = await verifyToken(req.body.refreshToken, config.get("privateKey"));
    let userData = await findUserById({ _id: decod.id });
    const accessToken = userData.generateAuthToken(userData._id);
    const refreshToken = userData.generateRefershToken(userData._id);
    return makeResponse(res, SUCCESS, true, REFRESH_TOKEN, { accessToken, refreshToken });
}));

//Login Admin
router.post('/login', validators('LOGIN'), catchAsyncAction(async (req, res) => {
    const { email, password } = req.body;
    const admin = await findByEmail({ email });
    if (!admin) return makeResponse(res, NOT_FOUND, false, USER_NOTFOUND);
    const passwordCorrect = await matchPassword(password, admin.password);
    if (!passwordCorrect) return makeResponse(res, BAD_REQUEST, false, INVALID);
    const accessToken = admin.generateAuthToken(admin._id);
    const refreshToken = admin.generateRefershToken(admin._id);
    let adminDetail = await userMapper(admin);
    return makeResponse(res, SUCCESS, true, LOGIN, adminDetail, { accessToken, refreshToken });
}));

/*
NOTE: for internal use only:--
*/
//Add Admin
router.post('/register', upload.fields([{ name: 'profile_pic', maxCount: 1 }]), catchAsyncAction(async (req, res) => {
    if (req?.files?.profile_pic?.length > 0) req.body.profile_pic = req.files.profile_pic[0].path;
    const admin = await findByEmail({ email: req.body.email });
    if (admin) return makeResponse(res, RECORD_ALREADY_EXISTS, false, ALREADY_EXIST);
    let password = await hashPassword(req.body.password);
    let reqstData = req.body;
    reqstData.password = password;
    let newAdmin = await addAdmin(reqstData);
    const accessToken = newAdmin.generateAuthToken(newAdmin._id);
    const refreshToken = newAdmin.generateRefershToken(newAdmin._id);
    return makeResponse(res, SUCCESS, true, ADMIN_ADDED, { accessToken, refreshToken });
}));


//Change Password
router.patch('/change-password', adminAuth, validators('CHANGE_PASSWORD'), (req, res) => {
    const { email, password } = req.adminData;
    matchPassword(req.body.oldPassword, password)
        .then(async result => {
            if (result) {
                return updateAdmin(email, { password: await hashPassword(req.body.newPassword) });
            }
            throw new Error(INVALID_PASSWORD);
        })
        .then(async () => {
            return makeResponse(
                res,
                SUCCESS,
                true,
                PASSWORD_CHANGED
            );
        })
        .catch(async error => {
            return makeResponse(
                res,
                BAD_REQUEST,
                false,
                error.message
            );
        });
});

//Forgot password
router.post('/forgot-password', validators('FORGET_PASSWORD'), (req, res) => {
    const otp = generateOtp();
    const { email } = req.body;
    findAdmin({ email })
        .then(admin => {
            console.log("getting admin", admin);
            if (!admin) throw new Error(EMAIL_NOT_REGISTER);
            return Promise.all(
                [
                    sendEmail({
                        from: privateKey.email,
                        to: req.body.email,
                        subject: 'OTP for password reset',
                        text: `The OTP for resetting your password is ${otp}`
                    }),
                    updateAdmin(req.body.email, { otp })
                ]
            )
        })
        .then(async result => {
            delete result[1]?._doc?.password;
            return makeResponse(res, SUCCESS, true, OTP_FOR_PASSWORD);
        })
        .catch(async error => {
            return makeResponse(res, BAD_REQUEST, false, error.message);
        });
});

//Verify OTP
router.post('/verify-otp', validators('VERIFY_OTP'), catchAsyncAction(async (req, res) => {
    let adminRecord = await findAdmin({ email: req.body.email });
    if (!adminRecord) throw new Error(EMAIL_NOT_REGISTER);
    if (adminRecord.otp === req.body.otp) return makeResponse(res, SUCCESS, true, VERIFY_OTP)
    return makeResponse(res, BAD_REQUEST, false, OTP_MISMATCH);
}));

//Reset password
router.post('/reset-password', validators('RESET_PASSWORD'), async (req, res) => {
    const { email, password } = req.body;
    updateAdmin(email, {
        password: await hashPassword(password)
    })
        .then(() => {
            return makeResponse(res, SUCCESS, true, RESET_PASSWORD);
        })
        .catch(async error => {
            return makeResponse(res, BAD_REQUEST, false, error.message);
        });
});

//Update Profile
router.patch('/', upload.fields([{ name: 'profile_pic', maxCount: 1 }]), adminAuth, catchAsyncAction(async (req, res) => {
    if (req?.files?.profile_pic?.length > 0) req.body.profile_pic = req.files.profile_pic[0].path;
    let updatedAdmin = await updateAdminProfile({ _id: req.adminData.id }, req.body);
    return makeResponse(res, SUCCESS, true, UPDATE_PROFILE, updatedAdmin);
}))

//Get all Vehicles list for super admin
router.get('/vehicles-list', adminAuth, catchAsyncAction(async (req, res) => {
    if (req.adminData.role != "SUPER-ADMIN") {
        return makeResponse(res, BAD_REQUEST, false, 'Only Super Admin Can View This List');
    }
    let page = 1,
        limit = 10,
        skip = 0
    if (req.query.page) page = req.query.page
    if (req.query.limit) limit = req.query.limit
    skip = (page - 1) * limit
    let vehicle = await findAllVehicles({ isDeleted: false }, parseInt(skip), parseInt(limit));
    let vehicleCount = await getVehiclesCount({ isDeleted: false });
    return makeResponse(res, SUCCESS, true, FETCH_ALL_VEHICLE, vehicle, {
        current_page: page,
        total_records: vehicleCount,
        total_pages: Math.ceil(vehicleCount / limit),
    });
}));

router.get('/filter-vehicles-list', adminAuth, catchAsyncAction(async (req, res) => {
    if (req.adminData.role != "SUPER-ADMIN") {
        return makeResponse(res, BAD_REQUEST, false, 'Only Super Admin Can View This List');
    }
    let searchingVehicles = {};
    let page = 1,
        limit = 10,
        skip = 0
    if (req.query.page) page = req.query.page
    if (req.query.limit) limit = req.query.limit
    skip = (page - 1) * limit
    let regx;
    let searchFilter = req.query;
    if (searchFilter) {
        console.log("inside conditions", searchFilter);
        if (searchFilter.color) searchingVehicles.color = searchFilter.color
        if (searchFilter.make) searchingVehicles.make = searchFilter.make
        if (searchFilter.price) searchingVehicles.price = searchFilter.price
        if (searchFilter.flue) searchingVehicles.flue = searchFilter.flue
        if (searchFilter.year) searchingVehicles.year = searchFilter.year
        if (searchFilter.model) searchingVehicles.model = searchFilter.model
        if (searchFilter.veriant_type) searchingVehicles.veriant_type = searchFilter.veriant_type
    };
    if (!searchFilter) {
        searchingVehicles = {
            isDeleted: false
        }
    };
    let vehicle = await findAllVehicles(searchingVehicles, parseInt(skip), parseInt(limit));
    let vehicleCount = await getVehiclesCount({ isDeleted: false });
    return makeResponse(res, SUCCESS, true, FETCH_ALL_VEHICLE, vehicle, {
        current_page: page,
        total_records: vehicleCount,
        total_pages: Math.ceil(vehicleCount / limit),
    });
}));


//Get all the admins
router.get('/admin-list', adminAuth, catchAsyncAction(async (req, res) => {
    if (req.adminData.role != "SUPER-ADMIN") {
        return makeResponse(res, BAD_REQUEST, false, 'Only Super Admin Can View This List');
    }
    let page = 1,
        limit = 10,
        skip = 0
    if (req.query.page) page = req.query.page
    if (req.query.limit) limit = req.query.limit
    skip = (page - 1) * limit
    let admin = await findAllAdmins({ isDeleted: false, role: 'ADMIN' }, parseInt(skip), parseInt(limit));
    let adminCount = await getAdminsCount({ isDeleted: false });
    return makeResponse(res, SUCCESS, true, FETCH_ALL_ADMIN, admin, {
        current_page: page,
        total_records: adminCount,
        total_pages: Math.ceil(adminCount / limit),
    });
}));

//Update Vehicle
router.patch('/approved-by-super-admin', adminAuth, catchAsyncAction(async (req, res) => {
    console.log("Update Vehicle", req.files);
    if (req.adminData.role != "SUPER-ADMIN") {
        return makeResponse(res, BAD_REQUEST, false, 'Only Super Admin Can View This List');
    }
    let updatedAdmin = await updateAdminBySuperAdmin({ _id: req.body.adminId }, req.body);
    return makeResponse(res, SUCCESS, true, APPROVED, updatedAdmin);
}));

//Get all Vehicles list 
router.get('/all-vehicles-list', catchAsyncAction(async (req, res) => {
    let page = 1,
        limit = 10,
        skip = 0
    if (req.query.page) page = req.query.page
    if (req.query.limit) limit = req.query.limit
    skip = (page - 1) * limit
    let vehicle = await findAllVehicles({ isDeleted: false }, parseInt(skip), parseInt(limit));
    let vehicleCount = await getVehiclesCount({ isDeleted: false });
    return makeResponse(res, SUCCESS, true, FETCH_ALL_VEHICLE, vehicle, {
        current_page: page,
        total_records: vehicleCount,
        total_pages: Math.ceil(vehicleCount / limit),
    });
}));


//Get all Vehicles list 
router.get('/filter-vehicles', catchAsyncAction(async (req, res) => {
    let page = 1,
        limit = 10,
        skip = 0
    if (req.query.page) page = req.query.page
    if (req.query.limit) limit = req.query.limit
    skip = (page - 1) * limit
    let vehicle = await findAllFilteredVehicles({ isDeleted: false }, parseInt(skip), parseInt(limit));
    const uniqueRecords = {};
    for (const record of vehicle) {
        const make = record.make;
        const key = `${record.color}_${record.make}_${record.price}_${record.year}_${record.model}_${record.veriant_type}`;

        // Check if the key is already in the uniqueRecords object
        if (!uniqueRecords[key]) {
            // If not, add the record to the uniqueRecords object
            uniqueRecords[key] = record;
        }
    }
    const uniqueData = Object.values(uniqueRecords);
    return makeResponse(res, SUCCESS, true, FETCH_ALL_VEHICLE, uniqueData);
}));


export const adminController = router;
