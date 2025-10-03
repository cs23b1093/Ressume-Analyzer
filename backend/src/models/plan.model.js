import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free',
        required: true
    },
    isFreeTrial: {
        type: Boolean,
        default: false
    },
    freeTrialExpiry: {
        type: Date,
        default: null
    },
    freeTrialDays: {
        type: Number,
        default: null
    },
    planExpiry: {
        type: Date,
        default: null
    },
    remainingDays: {
        type: Number,
        default: null
    },
    maxUsers: {
        type: Number,
        default: null
    },
    paymentDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

export const Plan = mongoose.model('Plan', planSchema);