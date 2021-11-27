const mongoose = require('mongoose');

const bookReviewsSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    reviews: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model('BookReviews', bookReviewsSchema);