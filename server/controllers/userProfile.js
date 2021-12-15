const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

/**
 * Controller to retrieve the Profile of the given User.
 */
const retrieveUserProfile = async (req, res) => {
    const profileId = req.params.profileId;
    try {
        const userProfile = await User.findById(profileId).exec();
        return res.status(200).json({
            name: userProfile?.name,
            profilePicUrl: userProfile?.profilePicUrl
        });
    }
    catch(err) {
        return res.status(500).json({
            message: "Error retrieving User profile's info. Please try again later."
        });
    }
};


/**
 * Controller to retrieve the user profile's books based on the type: {currently-reading, want-to-read, read, rated}.
 */
const retrieveUserProfileBooksByType = async (req, res) => {
    const profileId = req.params.profileId;
    const type = req.params.type;
    try {
        const profileActivity = await UserActivity.findOne({_id: profileId}).exec();
        const resObj = {};
        resObj[type] = profileActivity[type];
        return res.status(200).json(resObj);
    }
    catch(err) {
        console.log('Error retrieving User Profiles Books by type ', err);
        res.status(500).json({
            message: `Unable to retrieve the ${type} books of the User. Please try again later.`
        });
    }
};

module.exports.retrieveUserProfile = retrieveUserProfile;
module.exports.retrieveUserProfileBooksByType = retrieveUserProfileBooksByType;