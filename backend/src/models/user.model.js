import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: function() { return !this.googleId; } // Required only for non-OAuth users
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
        required: function() { return !this.googleId; } // Required only for non-OAuth users
    },
    username: {
        type: String,
        required: function() { return !this.googleId; }, // Required only for non-OAuth users
        unique: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    displayName: {
        type: String,
        default: null
    },
    firstName: {
        type: String,
        default: null
    },
    lastName: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    verifyCode: {
        type: Number,
        default: null
    },
    verified: {
        type: Boolean,
        default: function() { return !!this.googleId; } // Auto-verify OAuth users
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
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