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
            isFollowedByCurrentUser: userProfile?.followersMap?.get(userId),
            isCurrentUserFollowed: userProfile?.followingMap?.get(userId)
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
 * Controller to follow/unFollow a profile by the current User.
*/
const toggleFollowUserProfile = async (req, res) => {
    const userId = req.userId;
    const profileName = req.params.profileName;
    try {
        //Retrieve the Profile's Id from the User collection.
        const followingUser = await User.findOne({profileNameLower: profileName.toLowerCase()}).select("_id followersMap followersCount").exec();

        if(!followingUser) {
            return res.status(403).json({
                message: `Unable to retrieve ${profileName}'s profile. Please try again later.`
            });
        }

        //Retrieve the current User's details.
        const user = await User.findById(userId).select("followingMap followingCount").exec();
        if(!user) {
            return res.status(403).json({
                message: `Unable to retrieve ${profileName}'s followers. Please try again later.`
            });
        }

        
        if(!user.followingMap) {
            user.followingMap = new Map();
        }
        if(!followingUser.followersMap) {
            followingUser.followersMap = new Map();
        }

        let operation = "";
        //If the current profile is already being followed by the current User, unFollow it.
        //Else, Follow the current profile.
        if(user.followingMap.get(followingUser._id) === true) {
            operation = "unFollow";
            user.followingMap.delete(followingUser._id);
            followingUser.followersMap.delete(userId);
            user.followingCount = user.followingMap.size;
            followingUser.followersCount = followingUser.followersMap.size;
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    following: followingUser._id
                }
            }).exec();
            await User.findByIdAndUpdate(followingUser._id, {
                $pull: {
                    followers: userId
                }
            }).exec();
            await user.save();
            await followingUser.save();
        }
        else {
            operation = "Follow";
            user.followingMap.set(followingUser._id, true);
            followingUser.followersMap.set(userId, true);
            user.followingCount = user.followingMap.size;
            followingUser.followersCount = followingUser.followersMap.size;
            await User.findByIdAndUpdate(userId, {
                $push: {
                    following: followingUser._id
                }
            }).exec();
            await User.findByIdAndUpdate(followingUser._id, {
                $push: {
                    followers: userId
                }
            }).exec();
            await user.save();
            await followingUser.save();
        }

        res.status(200).json({
            message: operation === 'Follow' ?  `You're following ${profileName}` : `You've unfollowed ${profileName}`
        });
    }
    catch(err) {
        console.log(`Unable to ${operation} ${profileName}. `, err);
        res.status(500).json({
            message: `Unable to ${operation} ${profileName}. Please try again.`
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
            message: `Your profile has been successfully updated`
        });
    }
    catch(err) {
        console.log(`Unable to update the user profile`, err);
        return res.status(500).json({
            message: `Unable to update your profile. Please try again`
        });
    }
};


/**
 *  Controller to retrieve followers of a given user Profile. 
*/
const retrieveProfileFollowers = async (req, res) => {
    const userId = req.userId;
    const profileName = req.params.profileName;
    const skip = req.query?.skip - 0 || 0;

    const $sliceObj = {};
    $sliceObj.followers = {
        $slice: skip === 0 ? (-1 * skip) - 10 : [(-1 * skip) - 10, -skip - 10 + 10]
    };
    
    try {
        //Retrieve the current User's followingMap.
        const currentUser = await User.findById(userId).select("followingMap").exec();
        if(!currentUser) {
            return res.status(403).json({
                message: `Unable to retrieve ${profileName}'s followers. Please try again later.`
            });
        }

        //Retrieve the Profile's Id & followers based on skip(offset) & limit by default is 10, from the User collection.
        const profile = await User.findOne({profileNameLower: profileName.toLowerCase()}, $sliceObj).select("_id followersCount").exec();

        if(!profile) {//Profile doesn't exist case.
            return res.status(403).json({
                message: `Unable to retrieve ${profileName}'s followers. Please try again later.`
            });
        }

        //Retrieve the info of each follower profile & whether that profile is followed by the current User.
        const followers = [];
        for await (const followerId of profile.followers) {
            const follower = await User.findById(followerId).select("name bio profileName profilePicUrl followingMap").exec();
            if(follower) {
                const obj = {
                    name: follower.name,
                    profileName: follower.profileName,
                    bio: follower.bio,
                    profilePicUrl: follower.profilePicUrl,
                    isCurrentUserFollowed: follower.followingMap?.get(userId)
                };
                if(currentUser.followingMap && currentUser.followingMap.get && currentUser.followingMap.get(followerId))
                {
                    obj.isFollowedByCurrentUser = true;
                }
                else {
                    obj.isFollowedByCurrentUser = false;
                }
                followers.push(obj);
            }
        }

        return res.status(200).json({
            data: followers.reverse(),
            count: profile.followersCount
        });
    }
    catch(err) {
        console.log(`Unable to retrieve the followers of ${profileName}`, err);
        return res.status(500).json({
            message: `Unable to retrieve the followers of ${profileName}. Please try again`
        });
    }
};

/**
 * Controller to retrieve the profiles followed by the current Profile.
*/
const retrieveProfileFollowing = async (req, res) => {
    const userId = req.userId;
    const profileName = req.params.profileName;
    const skip = req.query?.skip - 0 || 0;

    const $sliceObj = {};
    $sliceObj.following = {
        $slice: skip === 0 ? (- 1 * skip) - 10 : [(-1 * skip) - 10, -skip - 10 + 10]
    };

    try {
        //Retrieve the current User's followingMap.
        const currentUser = await User.findById(userId).select("followingMap").exec();
        if(!currentUser) {
            return res.status(403).json({
                message: `Unable to retrieve ${profileName}'s followers. Please try again later.`
            });
        }

        //Retrieve the Profile's Id & following based on skip(offset) & limit by default is 10, from the User collection.
        const profile = await User.findOne({profileNameLower: profileName.toLowerCase()}, $sliceObj).select("_id followingCount").exec();

        if(!profile) {//Profile doesn't exist case.
           return res.status(403).json({
               message: `Unable to retrieve ${profileName}'s followers. Please try again later.`
           });
        }

        //Retrieve the info of each following profile & whether that profile is followed by the current User.
        const following = [];
        for await(const followingId of profile.following) {
            const followingProfile = await User.findById(followingId).select("name bio profileName profilePicUrl followingMap").exec();
            if(followingProfile) {
                const obj = {
                    name: followingProfile.name,
                    profileName: followingProfile.profileName,
                    bio: followingProfile.bio,
                    profilePicUrl: followingProfile.profilePicUrl,
                    isCurrentUserFollowed: followingProfile.followingMap?.get(userId)
                };
                if(currentUser.followingMap && currentUser.followingMap.get && currentUser.followingMap.get(followingId))
                {
                    obj.isFollowedByCurrentUser = true;
                }
                else {
                    obj.isFollowedByCurrentUser = false;
                }
                following.push(obj);
            }
        }

        return res.status(200).json({
            data: following.reverse(),
            count: profile.followingCount
        });
    }
    catch(err) {
        console.log(`Unable to retrieve the profiles followed by ${profileName}`, err);
        return res.status(500).json({
            message: `Unable to retrieve the profiles followed by ${profileName}. Please try again`
        });
    }
};

module.exports.retrieveUserProfile = retrieveUserProfile;
module.exports.retrieveUserProfileBooksByType = retrieveUserProfileBooksByType;
module.exports.updateUserProfileName = updateUserProfileName;
module.exports.validateUserProfileName = validateUserProfileName;
module.exports.toggleFollowUserProfile = toggleFollowUserProfile;
module.exports.updateUserProfileDetails = updateUserProfileDetails;
module.exports.retrieveProfileFollowers = retrieveProfileFollowers;
module.exports.retrieveProfileFollowing = retrieveProfileFollowing;