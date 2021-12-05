const UserActivity = require('../models/UserActivity');

const retrieveUserRatingsInfo = async (req, res) => {
    const userId = req.userId;
    try {
        const userActivity = await UserActivity.findById(userId).exec();
        return res.status(200).json({
            ratingMap: userActivity.ratingMap,
            ratingCount: userActivity.rated.length
        });
    }
    catch(err) {
        return res.status(500).json({
            message: `Unable to retrieve the User's rating info.`
        });
    }
};

const retrieveUserActivities = async (req, res) => {
    const userId = req.userId;
    try{
        const userActivity = await UserActivity.findById(userId).exec();
        return res.status(200).json({
            ratingMap: userActivity.ratingMap,
            ratingCount: userActivity.rated.length,
            reviews: userActivity.reviews
        });
    }
    catch(err) {
        return res.status(500).json({
            message: `Unable to retrieve the User activities.`
        });
    }
};

const retrieveUserReviews = async (req, res) => {
    const userId = req.userId;
    try{
        const userActivity = await UserActivity.findById(userId).exec();
        return res.status(200).json({
            reviews: userActivity.reviews
        });
    }
    catch(err) {
        return res.status(500).json({
            message: `Unable to retrieve the User activities.`
        });
    }
};

module.exports.retrieveUserRatingsInfo = retrieveUserRatingsInfo;
module.exports.retrieveUserActivities = retrieveUserActivities;
module.exports.retrieveUserReviews = retrieveUserReviews;