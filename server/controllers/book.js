const User = require('../models/User');

const updateUserBookDetails = (req, res) => {
    const userId = req.userId;
    const bookId = req.params.bookId;
    console.log('Request successfully received', userId, bookId);
};

module.exports = updateUserBookDetails;