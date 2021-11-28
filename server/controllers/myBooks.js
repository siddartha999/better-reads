const User = require('../models/User');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

/**
 * Controller to retrieve the currently-reading, want-to-read, read books for the current user, limit: 10 for each.
 */
const retrieveUserBooks = (req, res) => {
    const userId = req.userId;
    User.findById(userId).exec((err, user) => {
        if(err) {
            return res.status(500).json({
                message: "Experiencing connectivity issues with the Database. Please revisit later."
            });
        }

        if(user) {
            const resObj = {};
            resObj[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = user[BOOK_STATUS_CONSTANTS_WANT_TO_READ].slice(0, 11);
            resObj[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = user[BOOK_STATUS_CONSTANTS_CURRENTLY_READING].slice(0, 11);
            resObj[BOOK_STATUS_CONSTANTS_READ] = user[BOOK_STATUS_CONSTANTS_READ].slice(0, 11);
            res.status(200).json(resObj);
        }

    });
};


/**
 * Controller to retrive the Books for the current user based on the type: {currently-reading, want-to-read, read}.
 * Starting Index & Limit are expexted
 */
const retrieveUserBooksByType = (req, res) => {
    const userId = req.userId;
    const type = req.params.type;
    User.findById(userId).exec((err, user) => {
        if(err) {
            return res.status(500).json({
                message: "Experiencing connectivity issues with the Database. Please revisit later."
            });
        }

        if(user) {
            const resObj = {};
            resObj[type] = user[type];
            res.status(200).json(resObj);
        }

    });
};

module.exports.retrieveUserBooks = retrieveUserBooks;
module.exports.retrieveUserBooksByType = retrieveUserBooksByType;