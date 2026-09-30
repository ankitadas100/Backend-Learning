const app=require("./Src/app")
const { connect } =require("./Src/db")
connect();
app.listen(3000,()=>{
    console.log("server is running on port 3000")
})