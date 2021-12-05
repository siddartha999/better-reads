const UserActions = require('../models/UserActions');
const User = require('../models/User');
const {BOOK_STATUS_CONSTANTS_NONE} = require('../util/BookStatusConstants');

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
            newUserActions.actions.push(actionObj);
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
        action = `${userName} has rated ${data.bookName}`;
    }
    else if(data .currentStatus) {
        if(data.prevStatus && data.prevStatus !== BOOK_STATUS_CONSTANTS_NONE) {
            action = `${userName} has updated the status of ${data.bookName} from ${data.prevStatus} to ${data.currentStatus}`;
        }
        else {
            action = `${userName} has marked ${data.bookName} as ${data.currentStatus}`;
        }
    }
    else if(data.reviewContent) {
        action = `${userName} has reviewed ${data.bookName}`;
    }
    return action;
};

/**
 * Controller to retrieve the User actions.
 */
const retrieveUserActions = async (req, res) => {
    const userId = req.userId;
    try {
        const userActions = UserActions.findById(userId).exec();
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