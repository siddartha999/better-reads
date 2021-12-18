const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

/**
 * Controller to retrieve the Profile of the given User.
 */
const retrieveUserProfile = async (req, res) => {
    const profileName = req.params.profileName;
    const userId = req.userId;
    try {
        const userProfile = await User.findOne({profileNameLower: profileName.toLowerCase()}).exec();
        return res.status(200).json({
            name: userProfile?.name,
            profileName: userProfile?.profileName,
            bio: userProfile?.bio,
            profilePicUrl: userProfile?.profilePicUrl,
            followers: userProfile?.followers,
            following: userProfile?.following,
            isFollowedByCurrentUser: userProfile?.followersMap?.get(userId)
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
    const profileName = req.params.profileName;
    const type = req.params.type;
    try {
        //Retrieve the Profile's Id from the User collection.
        const user = await User.findOne({profileNameLower: profileName.toLowerCase()}).select("_id").exec();
        //Retrieve the Profile's activities.
        const profileActivity = await UserActivity.findById(user._id).exec();
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



/**
 * Controller to follow a profile by the current User.
*/
const followUserProfile = async (req, res) => {
    const userId = req.userId;
    const profileName = req.params.profileName;
    try {
        //Retrieve the Profile's Id from the User collection.
        const followingUser = await User.findOne({profileNameLower: profileName.toLowerCase()}).select("_id").exec();

        if(!followingUser) {
            return res.status(403).json({
                message: `Unable to retrieve ${profileName}'s profile. Please try again later.`
            });
        }

        //Push the followingUser's ID on to the User's following list.

        //#Duplicate case: Pull out
        await User.findByIdAndUpdate(userId, {
            $pull: {
                following: followingUser._id
            }
        }).exec();
        
        await User.findByIdAndUpdate(userId, {
            $push: {
                following: followingUser._id
            },
            $set: {
                followingMap: {
                    [followingUser._id]: true
                }
            }
        }).exec();


        //Push the current User's ID on to the followingUser's followers list.

        //#Duplicate case: Pull out
        await User.findByIdAndUpdate(followingUser._id, {
            $pull: {
                followers: userId
            }
        }).exec();


        await User.findByIdAndUpdate(followingUser._id, {
            $push: {
                followers: userId
            },
            $set: {
                followersMap: {
                    [userId]: true
                }
            }
        }).exec();

        res.status(200).json({
            message: `You're following ${profileName}`
        });
    }
    catch(err) {
        console.log(`Unable to follow ${profileName}. `, err);
        res.status(500).json({
            message: `Unable to follow ${profileName}. Please try again.`
        });
    }
};



/**
 * Controller to UnFollow a profile by the current User.
 */

const unFollowUserProfile = async (req, res) => {
    const userId = req.userId;
    const profileName = req.params.profileName;
    try {
        //Retrieve the Profile's Id from the User collection.
        const followingUser = await User.findOne({profileNameLower: profileName.toLowerCase()}).select("_id").exec();

        if(!followingUser) {
            return res.status(403).json({
                message: `Unable to retrieve ${profileName}'s profile. Please try again later.`
            });
        }

        //Pull out the followingUser's ID from the following-list of the current User.
        await User.findByIdAndUpdate(userId, {
            $pull: {
                following: followingUser._id
            },
            $set: {
                followingMap: {
                    [followingUser._id]: false
                }
            }
        }).exec();

        //Pull out the User's ID from the followers-list of the following User.
        await User.findByIdAndUpdate(followingUser._id, {
            $pull: {
                followers: userId
            },
            $set: {
                followersMap: {
                    [userId]: false
                }
            }
        }).exec();

        res.status(200).json({
            message: `You've Unfollowed ${profileName}`
        });
    }
    catch(err) {
        console.log(`Unable to Unfollow ${profileName}. `, err);
        res.status(500).json({
            message: `Unable to Unfollow ${profileName}. Please try again.`
        });
    }
};


/**
 * Controller to update the User profile details such as name, Bio.
 * name -> maxLen: 50
 * bio -> maxLen: 160
 */
const updateUserProfileDetails = async (req, res) => {
    const userId = req.userId;
    const name = req.body.profileDetails?.name?.slice(0, 50);
    const bio = req.body.profileDetails?.bio?.slice(0, 160);
    
    try {
        await User.findByIdAndUpdate(userId, {
            $set: {
                name: name,
                bio: bio
            }
        });

        return res.status(200).json({
            message: `Your profile has been updated successfully`
        });
    }
    catch(err) {
        console.log(`Unable to update the user profile`, err);
        return res.status(500).json({
            message: `Unable to update your profile. Please try again`
        });
    }
};


module.exports.retrieveUserProfile = retrieveUserProfile;
module.exports.retrieveUserProfileBooksByType = retrieveUserProfileBooksByType;
module.exports.updateUserProfileName = updateUserProfileName;
module.exports.validateUserProfileName = validateUserProfileName;
module.exports.followUserProfile = followUserProfile;
module.exports.unFollowUserProfile = unFollowUserProfile;
module.exports.updateUserProfileDetails = updateUserProfileDetails;