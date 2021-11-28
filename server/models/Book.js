const mongoose = require('mongoose');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

const modelObj = {
    _id: {
        type: String,
        required: true
    },
    ratings: {
        type: Array,
        default: []
    },
    ratingDetails: {
        type: Object,
        default: {}
    },
    averageRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    }
};

modelObj[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = {
    type: Number,
    default: 0
};

modelObj[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = {
    type: Number,
    default: 0
};

modelObj[BOOK_STATUS_CONSTANTS_READ] = {
    type: Number,
    default: 0
};

const bookSchema = mongoose.Schema(modelObj);

module.exports = mongoose.model('Book', bookSchema);