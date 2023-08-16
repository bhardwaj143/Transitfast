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