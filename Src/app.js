const express = require("express")
const app = express()

const User = require("./models/User");

app.use(express.json());

app.post("/user",async(req,res)=>{

const user=new User({
   name:req.body.name,
   email:req.body.email,
   age:req.body.age,
 })  
await user.save();
res.status(201).json({
   message:"created successfully"
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
