const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
    },
    qualification: {
        type: String,
        required: [true, 'Qualification is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    consent: {
        type: Boolean,
        required: [true, 'Consent is required'],
        validate: {
            validator: function (v) {
                return v === true;
            },
            message: 'You must provide consent to proceed'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: true
});

// Indexes are created in database.js
// This ensures email and phone uniqueness at DB level

module.exports = mongoose.model('Student', studentSchema);
