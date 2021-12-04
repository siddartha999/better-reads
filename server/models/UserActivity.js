/**
 * Schema to keep track of the activities performed by the user.
 */

const mongoose = require('mongoose');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

const ratingMap = {
    '5': {
        type: Number,
        default: 0
    },
    '4': {
        type: Number,
        default: 0
    },
    '3': {
        type: Number,
        default: 0
    },
    '2': {
        type: Number,
        default: 0
    },
    '1': {
        type: Number,
        default: 0
    }
};

const modelObj = {
    _id: {
        type: String,
        required: true
    },
    activity: {
        type: Array,
        default: [],
    },
    rated: {
        type: Array,
        default: []
    },
    ratingMap: ratingMap,
    reviews: {
        type: Array,
        default: []
    }
};

modelObj[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = {
    type: Array,
    default: []
};

modelObj[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = {
    type: Array,
    default: []
};

modelObj[BOOK_STATUS_CONSTANTS_READ] = {
    type: Array,
    default: []
};

const userActivitySchema = mongoose.Schema(modelObj);

module.exports = mongoose.model('UserActivity', userActivitySchema);