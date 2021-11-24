const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
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