const express=require("express");
const router=express.Router();
const User = require("../models/user");
const {createUser,getUser, getUserById, patchUser, deleteUser,loginUser,refreshToken}=require("../Controllers/UserController");
const authmiddleware = require("../middleware/authmiddleware");
const checkRole = require("../middleware/rolemiddleware");


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
router.post("/login", loginUser);
router.delete("/user/:id", deleteUser);
router.get("/profile",authmiddleware,async(req,res)=>{
    res.status(200).json({
        message:"profile accessed"
    })
})
router.get("/admin",authmiddleware,checkRole,(req,res)=>{
    res.status(200).json({
        message:"successs"
    })

})
router.post("/refresh",refreshToken);
module.exports = router;
