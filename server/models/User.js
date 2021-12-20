const mongoose = require('mongoose');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

const modelObj = {
    name: {
        type: String,
        required: true
    },
    profileName: {
        type: String
    },
    profileNameLower: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
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
    },
    followersMap: {
        type: Map,
        of: Boolean
    },
    followingMap: {
        type: Map,
        of: Boolean
    }
};

const userSchema = mongoose.Schema(modelObj);

userSchema.index({
    _id: 'text',
    profileNameLower: 'text'
});

module.exports = mongoose.model('User', userSchema); 