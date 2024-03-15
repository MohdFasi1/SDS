import mongoose from "mongoose";
const EmpDataSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
    isAdmin:Boolean
})

export const EmpData = mongoose.model('EmpData',EmpDataSchema)
