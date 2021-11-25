import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        let decodedData;
        if(token) {
            decodedData = jwt.verify(token, process.env.JWT_SIGNIN_KEY);
            req.userId = decodedData?.id;
        }
    }
    catch(error) {
        console.log("User Authentication error : " + error);
        res.status(400).json({
            message: "Unable to Authenticate the user. Please try to login again."
        });
    }
    next();
};

module.exports = auth;