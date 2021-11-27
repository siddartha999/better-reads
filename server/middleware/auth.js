const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        let decodedData;
        if(token) {
            decodedData = jwt.verify(token, process.env.JWT_SIGNIN_KEY);
            //Verify whether the token is acitve.
            console.log('exp: ' + decodedData.exp);
            if(decodedData.exp * 1000 < new Date().getTime()) {
                return res.status(401).json({
                    message: "Session has expired. Please login again."
                });
            }
            req.userId = decodedData._id;
            console.log('userID', req.userId);
        }
        else {
            return res.status(401).json({
                message: "Unable to Authenticate the user. Please try to login again."
            });
        }
    }
    catch(error) {
        console.log("User Authentication error : " + error);
        return res.status(401).json({
            message: "Unable to Authenticate the user. Please try to login again."
        });
    }
    next();
};

module.exports = auth;