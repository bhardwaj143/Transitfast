import { Requests } from '../../models/index.js';

//Add Request
export const addRequest = async (payload = {}, role) => {
    let requests = new Requests(payload);
    return requests.save();
};


//Find Request Id
//export const findRequestById = async (condition = {}) => await Requests.findOne(condition).exec();

export const findRequestById = (search = {}) => new Promise((resolve, reject) => {
    Requests.findOne(search)
        .then(resolve)
        .catch(reject)
})

//Find all Requests
export const findAllRequests = (search, skip, limit) => new Promise((resolve, reject) => {
    Requests.find(search)
        .skip(skip).limit(limit)
        .sort('-createdAt')
        .then(resolve)
        .catch(reject)
});

//Update Request
export const updateRequest = (_id, data) => new Promise((resolve, reject) => {
    Requests.findOneAndUpdate({ _id: _id }, { $set: data }, { new: true })
        .then(resolve)
        .catch(reject);
});

//Delete Request
export const deleteRequest = (id) => new Promise((resolve, reject) => {
    Requests.updateMany({ _id: { $in: id } }, { $set: { isDeleted: true } })
        .then(resolve)
        .catch(reject)
});

//Requests Count
export const getRequestsCount = (search) => new Promise((resolve, reject) => {
    Requests.countDocuments(search)
        .then(resolve)
        .catch(reject)
});
