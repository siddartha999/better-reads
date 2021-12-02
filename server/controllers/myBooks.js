const UserActivity = require('../models/UserActivity');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

/**
 * Controller to retrieve the currently-reading, want-to-read, read books for the current user, limit: 10 for each.
 */
const retrieveUserBooks = (req, res) => {
    const userId = req.userId;
    UserActivity.findById(userId).exec((err, userActivity) => {
        if(err) {
            return res.status(500).json({
                message: "Experiencing connectivity issues with the Database. Please revisit later."
            });
        }

        if(userActivity) {
            const resObj = {};
            resObj[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = userActivity[BOOK_STATUS_CONSTANTS_WANT_TO_READ].slice(0, 11);
            resObj[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = userActivity[BOOK_STATUS_CONSTANTS_CURRENTLY_READING].slice(0, 11);
            resObj[BOOK_STATUS_CONSTANTS_READ] = userActivity[BOOK_STATUS_CONSTANTS_READ].slice(0, 11);
            resObj['rated'] = userActivity['rated'].slice(0, 11);
            res.status(200).json(resObj);
        }

    });
};


/**
 * Controller to retrieve the Books for the current user based on the type: {currently-reading, want-to-read, read}.
 */
const retrieveUserBooksByType = (req, res) => {
    const userId = req.userId;
    const type = req.params.type;
    UserActivity.findById(userId).exec((err, userActivity) => {
        if(err) {
            return res.status(500).json({
                message: "Experiencing connectivity issues with the Database. Please revisit later."
            });
        }

        if(userActivity) {
            const resObj = {};
            resObj[type] = userActivity[type];
            return res.status(200).json(resObj);
        }
        else {
            return res.status(500).json({
                message: 'Unknown error.'
            });
        }

    });
};

module.exports.retrieveUserBooks = retrieveUserBooks;
module.exports.retrieveUserBooksByType = retrieveUserBooksByType;