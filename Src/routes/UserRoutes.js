const express=require("express");
const router=express.Router();
const User = require("../models/User");
router.post("/user", async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age
        });

        await user.save();

        res.status(201).json({
            message: "created successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "something went wrong"
        });
    }
});
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

router.get("/user", CheckUser, CheckRole, async (req, res) => {

    try {

        const user = await User.find();

        res.status(200).json({
            message: "read carefully",
            user: req.user
        });

    } catch (error) {

        res.status(500).json({
            message: "something went wrong"
        });

    }

});
router.get("/user/:id", async (req, res) => {

    const id = req.params.id;

    const user = await User.findById(id);

    res.status(200).json({
        message: "this is the new id",
        users: user
    });

});
router.patch("/user/:id", async (req, res) => {

    const id = req.params.id;

    const user = await User.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
    );

    res.status(200).json({
        message: "updated",
        users: user
    });

});



router.delete("/user/:id", async (req, res) => {

    const id = req.params.id;

    const user = await User.findByIdAndDelete(id);

    res.status(200).json({
        message: "delete this id",
        users: user
    });

});
module.exports = router;