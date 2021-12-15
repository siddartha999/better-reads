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
            profileName: userProfile?.profileName,
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


/**
 * Controller to validate whether the profileName already exists or not.
 */
const validateUserProfileName = async (req, res) => {
    const userId = req.userId;
    const profileName = req.params.profileName;
    console.log('Profile Name received: ', profileName);
    try {
        //Pre-checks.
        if(!profileName || profileName.length < 5 || profileName.length > 15 || hasSpecialCharacters(profileName) 
        || validateDigitsConstraint(profileName)) {
            return res.status(403).json({
                message: `${profileName} profileName does not match the required criteria.`
            });
        }  

        //Check whether the profileName exists already (case-insensitive version).
        const existingUser = await User.findOne({profileNameLower: profileName.toLowerCase()}).exec();

        //If a User already exists with the profileName, return.
        if(existingUser) {
            return  res.status(200).json({
                message: `${profileName} has already been taken`,
                severity: 'error'
            });
        }

        return res.status(200).json({
            message: `${profileName} is available`,
            severity: 'success'
        });
    }
    catch(err) {
        console.log(`Error validating User's profile name. `, err);
        res.status(500).json({
            message: `Error validating User's profile name. Please try again later.`
        });
    }
};


/**
 * Controller to update the profileName for the corresponding user in the User collection. 
 */
const updateUserProfileName = async (req, res) => {
    const userId = req.userId;
    const profileName = req.params.profileName;
    console.log('Received profile name: ', profileName);
    //Pre-checks.
    if(!profileName || profileName.length < 5 || profileName.length > 15 || hasSpecialCharacters(profileName) 
        || validateDigitsConstraint(profileName)) {
        return res.status(403).json({
            message: `${profileName} profileName does not match the required criteria.`
        });
    }

    try {
        //Check whether the profileName exists already (case-insensitive version).
        const existingUser = await User.findOne({profileNameLower: profileName.toLowerCase()}).exec();

        //If a User already exists with the profileName, return.
        if(existingUser) {
           return  res.status(200).json({
               message: `${profileName} Profile Name has already been taken`,
               severity: 'error'
           });
        }

        //Otherwise, update the profileName.
        const user = await User.findById(userId).exec();
        if(!user) {
            throw new Error('User does not exist.');
        }

        //Update the profileName & profileNameLower fields and save the changes.
        user.profileName = profileName;
        user.profileNameLower = profileName.toLowerCase();
        await user.save();
        return res.status(200).json({
            message: "Updated the Profile Name successfully.",
            severity: 'success'
        });
    }
    catch(err) {
        console.log(`Error updating User's profile name. `, err);
        res.status(500).json({
            message: `Error updating User's profile name. Please try again later.`
        });
    }
};


/**
 * Utility function to verify whether the profileName contains special characters.
 */
const hasSpecialCharacters = (profileName) => {
    const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if(format.test(profileName)) {
        return true;
    }
    return false;
};

 /**
     * Utility function to verify whether the profileName starts with a digit or contains only digits.
     */
  const validateDigitsConstraint = (profileName) => {
    if(!profileName || profileName.length === 0) return false;
    
    //If the first character is a digit
    if(profileName[0] >= '0' && profileName[0] <= '9') {
        return true;
    }

    //Check if all the characters are digits.
    let countDigits = 0;
    for(let index in profileName) {
        if(profileName[index] >= '0' && profileName[index] <= '9')
        {
            countDigits++;
        }
    }

    return countDigits === profileName.length;
};


module.exports.retrieveUserProfile = retrieveUserProfile;
module.exports.retrieveUserProfileBooksByType = retrieveUserProfileBooksByType;
module.exports.updateUserProfileName = updateUserProfileName;
module.exports.validateUserProfileName = validateUserProfileName;