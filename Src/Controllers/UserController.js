const User = require("../models/user");

const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const createUser=async(req,res)=>{
      const password = req.body.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      
    try {
      
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
           password:hashedPassword
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
const loginUser=async(req,res)=>{
    const{email,password}=req.body;
    const user=await User.findOne({email});
    if(!user){
       return res.status(401).json({
        message:"invalid email"
       })
       
    }
    const MatchPassword=await bcrypt.compare(password,user.password);
    if(MatchPassword){
        const token=jwt.sign(
        {userId:user._id,
        role:user.role},
       process.env.JWT_SECRET
    )
         res.status(200).json({
            message:"login sucessfull",
            token:token
         })
    }else{
       res.status(401).json({
        message:"password invalid"
       })
    }
   
   
}
module.exports= {createUser,getUser,getUserById,patchUser,deleteUser,loginUser};