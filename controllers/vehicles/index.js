import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import {  validators } from '../../middleware/index.js';
import  adminAuth  from '../../middleware/auth/admin.js';
import upload from '../../middleware/upload/index.js';
import { addVehicle, findVehicleById, findAllVehicles, updateVehicle, deleteVehicle, getVehiclesCount  } from '../../services/index.js';

//Response Status code
const { SUCCESS } = statusCodes;

//Response Messages
const { VEHICLE_ADDED, FETCH_ALL_VEHICLE, FETCH_VEHICLE, UPDATE_VEHICLE, DELETE_VEHICLE } = responseMessages;

const router = Router();


//Vehicle Added
router.post('/', upload.fields([{ name: 'vehicle_image', maxCount: 10 }]), adminAuth, catchAsyncAction(async (req, res) => {
    let images = [];
    if (req.files?.vehicle_image?.length > 0) {
        await Promise.all(
            req.files.vehicle_image.map(async file => {
                images.push(file.path);
            })
        );
    };
    req.body.vehicle_image = images;
    let vehicle = await addVehicle(req.body);
    return makeResponse(res, SUCCESS, true, VEHICLE_ADDED, vehicle);
}));

//Get all Vehicles
router.get('/', adminAuth, catchAsyncAction(async (req, res) => {
    let page = 1,
        limit = 10,
        skip = 0
    if (req.query.page) page = req.query.page
    if (req.query.limit) limit = req.query.limit
    skip = (page - 1) * limit
    let vehicle = await findAllVehicles({ adminId: req.adminData._id , isDeleted: false}, parseInt(skip), parseInt(limit));
    let vehicleCount = await getVehiclesCount({adminId: req.adminData._id , isDeleted: false});
    return makeResponse(res, SUCCESS, true, FETCH_ALL_VEHICLE, vehicle,{
        current_page: page,
        total_records: vehicleCount,
        total_pages: Math.ceil(vehicleCount / limit),
    });
}));

//Get Vehicle ById
router.get('/:id', adminAuth, catchAsyncAction(async (req, res) => {
    let vehicle = await findVehicleById({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_VEHICLE, vehicle);
}));

//Update Vehicle
router.patch('/:id', upload.fields([{ name: 'vehicle_image', maxCount: 1 }]), adminAuth, catchAsyncAction(async (req, res) => {
    console.log("Update Vehicle", req.files);
    if (req?.files?.vehicle_image?.length > 0) req.body.vehicle_image = req.files.vehicle_image[0].path;
    let updatedVehicles = await updateVehicle({ _id: req.params.id }, req.body);
    return makeResponse(res, SUCCESS, true, UPDATE_VEHICLE, updatedVehicles);
}))

//Delete Vehicle
router.delete('/:id', adminAuth, catchAsyncAction(async (req, res) => {
    let vehicle = await deleteVehicle({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, DELETE_VEHICLE, []);
}));



export const vehicleController = router;
