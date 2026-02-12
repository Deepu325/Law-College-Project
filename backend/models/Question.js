const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        enum: ['RC', 'LEGAL'],
        uppercase: true
    },
    passageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage',
        default: null
    },
    passageText: {
        type: String,
        default: null
    },
    questionNumber: {
        type: Number,
        required: true
    },
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v.length === 4;
            },
            message: 'Must have exactly 4 options'
        }
    },
    correctOption: {
        type: String,
        required: [true, 'Correct option is required'],
        enum: ['A', 'B', 'C', 'D'],
        uppercase: true
    },
    marks: {
        type: Number,
        required: true,
        default: 1,
        min: 0
    }
}, {
    timestamps: true
});

// Index for efficient querying
questionSchema.index({ section: 1, questionNumber: 1 });

module.exports = mongoose.model('Question', questionSchema);
