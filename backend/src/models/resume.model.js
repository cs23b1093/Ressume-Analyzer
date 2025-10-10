import mongoose from 'mongoose';
import argon2d from 'argon2';

const resumeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    education: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    projects: {
        type: [String],
        required: true
    },
    certifications: {
        type: [String],
        required: true
    },
    awards: {
        type: [String],
        required: true
    },
    references: {
        type: [String],
        required: true
    },
    hobbies: {
        type: [String],
        required: true
    },
    languages: {
        type: [String],
        required: true
    },
    social_media: {
        type: [String],
        required: true
    },
    links: {
        type: [String],
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    objective: {
        type: String,
        required: true
    },
    achievements: {
        type: [String],
        required: true
    },
    ATS_Score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
})

resumeSchema.index({ user_id: 1 }, { unique: true });

// // TODO: recheck 
resumeSchema.pre('save', async function() {
    const fields = ['phone', 'adderss', 'email']

    for (const field of fields) {
        if (!this.isModified(this[field]) || !this[field]) continue;
        this[field] = await argon2d.hash(this[field]);
    }
})


export const Resume = mongoose.model('Resume', resumeSchema);