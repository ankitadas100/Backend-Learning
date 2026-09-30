const mongoose=require("mongoose");
require("dotenv").config();
const connect=async()=>{
    await mongoose .connect(process.env.MongoURI)
        console.log("Database connected");
}
module.exports={
    connect
}
