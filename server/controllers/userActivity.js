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

module.exports.retrieveUserRatingsInfo = retrieveUserRatingsInfo;