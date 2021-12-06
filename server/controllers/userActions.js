const UserActions = require('../models/UserActions');
const User = require('../models/User');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

/**
 * Controller to insert an action for the User.
 */
const insertUserAction = async (data) => {
    try {
        const userId = data.userId;
        const user = await User.findById(userId).exec();
        const userName = user.name;
        const profilePicUrl = user.profilePicUrl;
        let action = generateUserAction(data, userName);
        let actionObj = {
            bookId: data.bookId,
            cover: data.cover,
            bookName: data.bookName,
            userName: userName,
            profilePicUrl: profilePicUrl,
            rating: data.rating,
            timestamp: Date.now(),
            reviewContent: data.reviewContent,
            action: action
        };
        const userActions =  await UserActions.findById(userId).exec();
        let newUserActions = userActions;
        if(newUserActions) {//UserId already exists.
            newUserActions.actions.unshift(actionObj);
        }
        else {//This is the first action inserted for the user.
            newUserActions = new UserActions({_id: userId, actions: [actionObj]});
        }
        const response = await newUserActions.save();
        console.log(response);
    }
    catch(err) {
       console.log(err);
    }
};
/**
 * Function to generate the user-action.
 */
const generateUserAction = (data, userName) => {
    let action = "";
    if(data.rating) {
        action = `${userName} rated a book`;
    }
    else if(data .currentStatus) {
        if(data.currentStatus === BOOK_STATUS_CONSTANTS_WANT_TO_READ) {
            action = `${userName} wants to read`;
        }
        else if(data.currentStatus === BOOK_STATUS_CONSTANTS_READ) {
            action = `${userName} finished reading`;
        }
        else if(data.currentStatus === BOOK_STATUS_CONSTANTS_CURRENTLY_READING) {
            action = `${userName} is currently reading`;
        }
    }
    else if(data.reviewContent) {
        action = `${userName} has left a review for`;
    }
    return action;
};

/**
 * Controller to retrieve the User actions.
 */
const retrieveUserActions = async (req, res) => {
    const userId = req.userId;
    try {
        const userActions = await UserActions.findById(userId).exec();
        return res.status(200).json({
            userActions: userActions.actions
        });
    }
    catch(err){
        return res.status(500).json({
            message: "We're experiencing connectivity issues with the Database. Please revisit later."
        });
    }
};

module.exports.retrieveUserActions = retrieveUserActions;
module.exports.insertUserAction = insertUserAction;