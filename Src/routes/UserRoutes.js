const express=require("express");
const router=express.Router();
const User = require("../models/User");
const {createUser,getUser, getUserById, patchUser, deleteUser}=require("../Controllers/UserController");


router.post("/user",createUser);
    

const CheckUser = (req, res, next) => {

    req.user = {
        name: "Ankita",
        age: 21,
        role: "user"
    };

    console.log("User middleware");
    next();
};
const CheckRole = (req, res, next) => {

    if (req.user.role === "user") {
        next();
    } 
    else {
        res.status(403).json({
            message: "access denied"
        });
    }
};

router.get("/user", CheckUser, CheckRole,getUser);
router.get("/user/:id",getUserById);
router.patch("/user/:id", patchUser);



router.delete("/user/:id", deleteUser);
module.exports = router;
