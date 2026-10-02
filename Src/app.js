const express = require("express")
const app = express()

const User = require("./models/User");

app.use(express.json());
app.use((req, res, next) => {
    console.log("Middleware 1 is running");
    next();
});
app.use((req, res, next) => {
    console.log("Middleware 2");
    next();
});
app.post("/user",async(req,res)=>{
try{
const user=new User({
   name:req.body.name,
   email:req.body.email,
   age:req.body.age,
 })  
await user.save();
res.status(201).json({
   message:"created successfully"
})
}catch(error){
   res.status(500).json({
      message:"something went wrong"
   })
}
})
const CheckUser=(req,res,next)=>{
   req.user={
   name:"Ankita",
   age:21,
   role:"role"
   }

    console.log("User middleware");
    next();
}
const CheckRole=(req,res,next)=>{
if(req.user.role==="user"){
   next();
  
}
else{
   res.status(403).json({
      message:"access denied"
   })
}
}

app.get("/user",CheckUser,CheckRole,async(req,res)=>{
   try{
   const user=await User.find()
   res.status(200).json({
      message:"read carefully",
      user:req.user,
      role:req.role,
      age:req.age
   })
}catch(error){
   res.status(500).json({
      message:"something went wrong"
   })
}
})
app.get("/user/:id",async(req,res)=>{
   const id=req.params.id;
   const user=await User.findById(id)
   res.status(200).json({
      message:"one specific id is read",
     users:user
   })
})
app.post("/user",async(req,res)=>{
   const user=new User({
     name:req.body.name,
     email:req.body.email,
     age:req.body.age 
   })
   await user.save();
   res.status(200).json({
      message:"new data created"
   })
})

app.get("/user",async(req,res)=>{
   const user=await User.find();
   res.status(200).json({
      message:"read Done ",
      users:user
   })
})

app.get("/user/:id",async(req,res)=>{
   const id=req.params.id;
   const user=await User.findById(id);
   res.status(200).json({
      message:"this is the new id",
      users:user
   })
})
app.patch("/user/:id/",async(req,res)=>{
   const id =req.params.id;
   const user=await User.findByIdAndUpdate(id,req.body, { new: true });
   res.status(200).json({
      message:"updated",
      users:user
   })
})
app.delete("/user/:id",async(req,res)=>{
   const id=req.params.id;
   const user=await User.findByIdAndDelete(id);
   res.status(200).json({
      message:"delet this id",
      users:user
   })
})

// const notes = []
// app.post("/notes", (req, res) => {
//    notes.push(req.body)
//    res.status(201).json({
//       Message: "note created successfully"
//    })
//    app.get("/notes", (req, res) => {
//       res.status(200).json({
//          Message: "fetched succesfully",
//          notes: notes
//       })
//    })
//    app.delete("/notes/:index", (req, res) => {
//       const index = req.params.index
//       delete notes[index]
//       res.status(200).json({
//          Message: "deleted sucessfully"
//       })
//    })
//    app.patch("/notes/:index", (req, res) => {
//       const index = req.params.index
//       const description = req.body.description
//       notes[index].description = description
//       res.status(200).json({
//          Message: "updated"
//       })
//    })
// })
module.exports = app
