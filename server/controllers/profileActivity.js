const UserActivity = require('../models/UserActivity');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');
/**
 * Controller to retrieve Activities by the profile.
 */
const retrieveProfileActivities = async (req, res) => {
    const profileId = req.params.profileId;
    try{
        const sliceObj = {};
        sliceObj[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = {$slice: [0, 3]};
        sliceObj[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = {$slice: [0, 3]};
        sliceObj[BOOK_STATUS_CONSTANTS_READ] = {$slice: [0, 3]};
        const profileActivity = await UserActivity.findById(profileId, sliceObj).select("reviews ratingMap rated").exec();
        const resObj = {};
        if(profileActivity) {
            resObj.ratingMap = profileActivity.ratingMap;
            resObj.ratingCount = profileActivity.rated?.length,
            resObj.reviewsCount = profileActivity.reviews?.length;
            resObj.profileBooks = {};
            resObj.profileBooks[BOOK_STATUS_CONSTANTS_WANT_TO_READ] = profileActivity[BOOK_STATUS_CONSTANTS_WANT_TO_READ];
            resObj.profileBooks[BOOK_STATUS_CONSTANTS_CURRENTLY_READING] = profileActivity[BOOK_STATUS_CONSTANTS_CURRENTLY_READING];
            resObj.profileBooks[BOOK_STATUS_CONSTANTS_READ] = profileActivity[BOOK_STATUS_CONSTANTS_READ];
        }
        return res.status(200).json(resObj);
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({
            message: `Unable to retrieve the activities for the current Profile.`
        });
    }
};

/**
 * Controller to retrieve ratings by the Profile.
 */

const retrieveProfileReviews = async (req, res) => {
    const profileId = req.params.profileId;
    try{
        //Retrieve just the reviews object.
        const profileActivity = await UserActivity.findById(profileId).select("reviews").exec();
        return res.status(200).json({
            reviews: profileActivity?.reviews
        });
    }
    catch(err) {
        return res.status(500).json({
            message: `Unable to retrieve the User activities.`
        });
    }
};

module.exports.retrieveProfileActivities = retrieveProfileActivities;
module.exports.retrieveProfileReviews = retrieveProfileReviews;