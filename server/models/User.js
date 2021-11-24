const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: false
    },
    activity: {
        type: Array,
        default: [],
    },
    statistics: {
        type: Object,
        default: {}
    }
});

module.exports = mongoose.model('User', userSchema); 