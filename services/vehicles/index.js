import V1 from 'twilio/lib/rest/bulkexports/V1.js';
import { Vehicles } from '../../models/index.js';

//Adds Categories
export const addVehicle = async (payload = {}, role) => {
    let vehicle = new Vehicles(payload);
    return vehicle.save();
};


//Find Vehicle Id
export const findVehicleById = async (condition = {}) => await Vehicles.findOne(condition).exec();


//Find all Vehicles
export const findAllVehicles = (search, skip, limit) => new Promise((resolve, reject) => {
    Vehicles.find(search)
        .populate('adminId', 'email')
        .skip(skip).limit(limit)
        .sort('-createdAt')
        .then(resolve)
        .catch(reject)
});

//Update Vehicles
export const updateVehicle = (_id, data) => new Promise((resolve, reject) => {
    Vehicles.findOneAndUpdate({ _id: _id }, { $set: data }, { new: true })
        .then(resolve)
        .catch(reject);
});

//Delete Vehicles
export const deleteVehicle = (id) => new Promise((resolve, reject) => {
    Vehicles.updateMany({ _id: { $in: id } }, { $set: { isDeleted: true } })
        .then(resolve)
        .catch(reject)
});

//Vehicles Count
export const getVehiclesCount = (search) => new Promise((resolve, reject) => {
    Vehicles.countDocuments(search)
        .then(resolve)
        .catch(reject)
});


//Find all Filtered Vehicles
export const findAllFilteredVehicles = (search, skip, limit) => new Promise((resolve, reject) => {
    Vehicles.find(search).select('color make price fuel year model veriant_type')
        .populate('adminId', 'email')
        .skip(skip).limit(limit)
        .sort('-createdAt')
        .then(resolve)
        .catch(reject)
});