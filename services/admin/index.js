import { Admins } from '../../models/index.js';

//Add admin
export const addAdmin = async (payload = {}) => {
  let admin = new Admins(payload);
  return admin.save();
};

//Find by admin
export const findByEmail = async (email) => Admins.findOne(email)

//Find admin details
export const findAdminById = (search = {}) => new Promise((resolve, reject) => {
	Admins.findOne(search).select('-password')
		.then(resolve)
		.catch(reject)
});


export const findAdmin = async (email) => Admins.findOne(email).select('-password')

//Change Password
export const updateAdmin = (email, data) => new Promise((resolve, reject) => {
  Admins.findOneAndUpdate({ email: email }, data)
    .then(resolve)
    .catch(reject);
});

//Update Admin Profile
export const updateAdminProfile = (_id, data) => new Promise((resolve, reject) => {
  Admins.findOneAndUpdate({ _id: _id }, { $set: data }, { new: true })
      .then(resolve)
      .catch(reject);
});

//Find all admins
export const findAllAdmins = (search, skip, limit) => new Promise((resolve, reject) => {
  Admins.find(search)
      .skip(skip).limit(limit)
      .sort('-createdAt')
      .then(resolve)
      .catch(reject)
});

//Admins Count
export const getAdminsCount = (search) => new Promise((resolve, reject) => {
  Admins.countDocuments(search)
      .then(resolve)
      .catch(reject)
});


//Update Admin
export const updateAdminBySuperAdmin = (_id, data) => new Promise((resolve, reject) => {
  Admins.findOneAndUpdate({ _id: _id }, { $set: data }, { new: true })
      .then(resolve)
      .catch(reject);
});