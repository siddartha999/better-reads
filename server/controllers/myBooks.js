const UserActivity = require('../models/UserActivity');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

/**
 * Controller to retrieve the currently-reading, want-to-read, read books for the current user, limit: 11(1 additional to display 
 * show-more option).
 */
const retrieveUserBooks = async (req, res) => {
    const userId = req.userId;
    try{
        let sliceObj = {};
        sliceObj['rated'] = {$slice: [0, 11]};
        sliceObj[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = {$slice: [0, 11]};
        sliceObj[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = {$slice: [0, 11]};
        sliceObj[BOOK_STATUS_CONSTANTS_READ] = {$slice: [0, 11]};
        const userActivity = await UserActivity.findById(userId, sliceObj);
        const resObj = {};
        if(userActivity) {
            resObj[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = userActivity[BOOK_STATUS_CONSTANTS_WANT_TO_READ];
            resObj[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = userActivity[BOOK_STATUS_CONSTANTS_CURRENTLY_READING];
            resObj[BOOK_STATUS_CONSTANTS_READ] = userActivity[BOOK_STATUS_CONSTANTS_READ];
            resObj['rated'] = userActivity['rated'];
        }
        res.status(200).json(resObj);
    }
    catch(err) {
        console.log('MyBooks Error: ', err);
        return res.status(500).json({
            message: "Experiencing connectivity issues with the Database. Please revisit later."
        });
    }
};


/**
 * Controller to retrieve the Books for the current user based on the type: {currently-reading, want-to-read, read, rated}.
 */
const retrieveUserBooksByType = async (req, res) => {
    const userId = req.userId;
    const type = req.params.type;
    try {
        const userActivity = await UserActivity.findOne({_id: userId}).exec();
        const resObj = {};
        resObj[type] = userActivity[type];
        return res.status(200).json(resObj);
    }
    catch(err) {
        console.log('Error retrieving UserBooks by type ', err);
        res.status(500).json({
            message: `Unable to retrieve the ${type} books of the User. Please try again later.`
        });
    }
};


/**
 * Tester function
 */
const testUserBooks = async (req, res) => {
    try{
        const response = await UserActivity.aggregate().match("61a2e278a6d7eceebec2fa25").project({
            'rated': {$slice: [0, 10]},
            
        }).exec();
        console.log(response);
        res.status(200).json(response);
    }
    catch(err) {
        console.log('unexpected err', err);
    }
};

module.exports.retrieveUserBooks = retrieveUserBooks;
module.exports.retrieveUserBooksByType = retrieveUserBooksByType;
module.exports.testUserBooks = testUserBooks;