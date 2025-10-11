import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    // title, description, company_name, company_details, job_adder, 
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company_name: {
        type: String,
        required: true
    },
    company_details: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    job_adder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salary: {
        type: Number,
        default: null
    },
    experience: {
        type: Number,
        default: null
    },
    skills: {
        type: [String],
        default: []
    },
    applications: {
        type: Number,
        default: 0
    },
    created_At: {
        type: Date,
        default: Date.now
    },
    updated_At: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
})

export const Job = mongoose.model('Job', jobSchema);