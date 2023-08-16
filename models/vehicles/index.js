import mongoose from "mongoose";

const vehiclesSchema = mongoose.Schema({
    adminId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admins'
    },
    vehicle_image: {
        type: String,
        required: false
    },
    licence_plate: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    car_description: {
        type: String,
        required: false
    },
    make: {
        type: String,
        required: false
    },
    year: {
        type: Number,
        required: false
    },
    model: {
        type: String,
        required: false
    },
    veriant_type: {
        type: String,
        required: false
    },
    mileage: {
        type: Number,
        required: false
    },
    engine_size: {
        type: String,
        required: false
    },
    color: {
        type: String,
        required: false
    },
    transmission: {
        type: String,
        required: false
    },
    fuel: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
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


const Vehicles = mongoose.model('Vehicles', vehiclesSchema);

export { Vehicles };
