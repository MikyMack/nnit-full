const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    // Optional fields
    dateOfBirth: { type: Date },
    address: { type: String },
    studentId: { type: String },
    selectedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    progressStats: {
        type: mongoose.Schema.Types.Mixed 
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
