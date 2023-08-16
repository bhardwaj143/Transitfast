import mongoose from "mongoose";

const requestsSchema = mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admins'
    },
    requestedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admins'
    },
    vehicleId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicles'
    },
    requestStatus: {
        type: String,
        required: false
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


const Requests = mongoose.model('Requests', requestsSchema);

export { Requests };
