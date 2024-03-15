import mongoose from "mongoose";
const EmpSchema = new mongoose.Schema({
    id:String,
    date:String,
    day: String,
    time_in: String,
    time_out:String,
    total_time:Number,
    notes:String,
})

export const Emp = mongoose.model('attendance',EmpSchema)
