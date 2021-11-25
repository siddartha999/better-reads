const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthController = (req, res) => {
    const {tokenId} = req.body;
    googleClient.verifyIdToken({idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID})
    .then(response => {
        const {email_verified, email, name, picture} = response.payload;
        if(email_verified) {
            User.findOne({email}).exec((err, user) => {
                if(err) {
                    return res.status(400).json({
                        error: "We're experiencing few issues with the Database. Please try again later."
                    });
                }
                else {
                    if(user) { //The User already exists in the DB.
                        //Create a JWT token & return that.
                        const token = jwt.sign({_id: user._id, name: user.name}, process.env.JWT_SIGNIN_KEY, {expiresIn: '7d'});
                        const {_id, name, email, profilePicUrl} = user;
                        res.json({
                            token,
                            user: {_id, name, email, profilePicUrl}
                        });
                    }
                    else { // User is new, need to create an entry in the DB.
                        const newUser = new User({name, email, profilePicUrl: picture});
                        newUser.save((err, data) => {
                            if(err) {
                                return res.status(400).json({
                                    error: "Error signing in the user. Please try again later"
                                });
                            }
                            else {
                                //Create a JWT token & return that.
                                const token = jwt.sign({_id: data._id, name: data.name}, process.env.JWT_SIGNIN_KEY, {expiresIn: '7d'});
                                const {_id, name, email, profilePicUrl} = newUser;
                                res.json({
                                    token,
                                    user: {_id, name, email, profilePicUrl}
                                });
                            }
                        });
                    }
                }
            });
        }
        else {
            return res.status(400).json({
                error: "Invalid Google Token. Please try to login via Google Authentically."
            });
        }
    });
}

module.exports = googleAuthController;