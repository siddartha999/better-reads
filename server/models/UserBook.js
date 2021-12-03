const mongoose = require('mongoose');

const userBookSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    bookId: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        required: false,
        default: 'None'
    },
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    targetDate: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('UserBook', userBookSchema);