const mongoose = require('mongoose');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

const modelObj = {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profilePicUrl: {
        type: String,
        required: false
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    }
};

const userSchema = mongoose.Schema(modelObj);

module.exports = mongoose.model('User', userSchema); 