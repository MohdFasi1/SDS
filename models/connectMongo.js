import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_CONNECT_URI)
        console.log("connected to db")
    }
    catch(err){
        console.log("error:"+err.message)
    }
}
export default connectDB