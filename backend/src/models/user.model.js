import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    avatar_url: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    verifyCode: {
        type: Number,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        default: null
    },
    planType: {
        type: String,
        enum: ['Free', 'Pro'],
        default: 'Free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timeseries: true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await argon2.hash(this.password);
    next();
})

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

export const User = mongoose.model('User', userSchema);

// TODO:
    /* 
        Frontend
            -> parsing -> send to model -> find ATS and gives response 
            -> jobs matching via link or current existing jobs in database
            -> updating resume
            -> download feature 
            -> post to social media

        Backend 
            -> Storing user, resume and plan data
            -> notification => gmail
            -> catching, encryption user persional data
            -> oAuth and simple auth
            -> subscription handling, autopayment    
    */