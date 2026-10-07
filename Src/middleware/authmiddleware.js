const jwt = require("jsonwebtoken");

const authmiddleware = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
           return res.status(401).json({
                message: "authorization header missing"

            })
        }
        const parts=req.headers.authorization.split(" ");
        if(parts[0]!=="Bearer" || !parts[1]){
            return res.status(401).json({
                message:"invalid  authorization header"
            })
        }
        const token = parts[1];

        const jwtverify = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = jwtverify;

        next();
    }
    catch {
        res.status(401).json({
            message: "invalid token"
        })
    }
};

module.exports = authmiddleware;