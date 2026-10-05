const jwt = require("jsonwebtoken");

const authmiddleware = async (req, res, next) => {
try{
    const token = req.headers.authorization.split(" ")[1];

    const jwtverify = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    req.user = jwtverify;

    next();
}
catch{
    res.status(401).json({
        message:"invalid token"
    })
}
};

module.exports = authmiddleware;