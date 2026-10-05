const User = require("../models/User");
const createUser=async(req,res)=>{
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
            console.log(error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
}
const getUser=async(req,res)=>{
       try {

        const user = await User.find();

        res.status(200).json({
            message: "read carefully",
            user: user
        });

    } catch (error) {

        res.status(500).json({
            message: "something went wrong"
        });

    }
}
const getUserById=async(req,res)=>{
     const id = req.params.id;

    const user = await User.findById(id);

    res.status(200).json({
        message: "this is the new id",
        users: user
    });
}
const patchUser=async(req,res)=>{
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
}
const deleteUser=async(req,res)=>{
     const id = req.params.id;

    const user = await User.findByIdAndDelete(id);

    res.status(200).json({
        message: "delete this id",
        users: user
    });

}
module.exports= {createUser,getUser,getUserById,patchUser,deleteUser};