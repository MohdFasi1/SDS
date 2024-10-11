import express from "express"
import mongoose from "mongoose"
import { Emp } from "./models/emp.js"
import cors from 'cors'
import bcrypt from 'bcrypt';
import { EmpData } from './models/login.js';
import { config } from "dotenv";
config()
import connectDB from "./connectMongo.js";
const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5174',  // Set the correct frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,  // If you're using cookies, sessions, etc.
  allowedHeaders: 'Content-Type, Authorization',  // Add other headers if needed
};
app.use(cors(corsOptions));
connectDB()
app.post('/', async (req, res) => {
  try {
    let a = req.body;
    const emp = await Emp.findOne({ id: a.id, date: a.date })
    if (emp) {
      res.json({ message: `You have already submitted for ${a.date}` })
    }
    else {
      let date = a.date.split("-")
      let formDate = new Date(date[0], date[1] - 1, date[2])
      var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var time1 = new Date(formDate.toDateString() + " " + a.time_in)
      var time2 = new Date(formDate.toDateString() + " " + a.time_out)
      let timeDiff = time2 - time1
      const data = new Emp({
        id: a.id,
        date: a.date,
        day: daysOfWeek[formDate.getDay()],
        time_in: a.time_in,
        time_out: a.time_out,
        total_time: timeDiff / (1000 * 60),
        notes: a.notes
      })
      data.save()
      res.json({ data, message: `Data Submitted Successfully` })
    }
  } catch (err) {
    console.error(err)
    res.json({ message: `There was an error while submiting data, Please Try again` })
  }
})
app.put('/', async (req, res) => {
  try {
    let a = req.body;
    let date = a.date.split("-")
    let formDate = new Date(date[0], date[1] - 1, date[2])
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var time1 = new Date(formDate.toDateString() + " " + a.time_in)
    var time2 = new Date(formDate.toDateString() + " " + a.time_out)
    let timeDiff = time2 - time1
    const data = await Emp.updateOne({_id: a._id},
      {
      date: a.date,
      day: daysOfWeek[formDate.getDay()],
      time_in: a.time_in,
      time_out: a.time_out,
      total_time: timeDiff / (1000 * 60),
      notes: a.notes
    })
    res.json({ data, message: `Data Edited Successfully` })

  } catch (err) {
    console.error(err)
    res.json({ message: `There was an error while submiting data, Please Try again` })
  }
})
app.get('/employees', async (req, res) => {
  const data = await EmpData.find()
  res.json(data)
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await EmpData.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return res.json({ data: user });
    } else {
      return res.json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
})



app.get('/attendance/:id/:fromDate/:toDate', async (req, res) => {
  try {
    const { id, fromDate, toDate } = req.params;
    const data = await Emp.find({
      id: id,
      date: { $gte: fromDate, $lte: toDate }
    });
    const distDates = await Emp.distinct('date',{
      date: { $gte: fromDate, $lte: toDate }
  })
  const count = {
    total:distDates.length,
    present:data.length,
    absent:distDates.length-data.length
  }
    res.json({data,count});
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/employee', async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    const user = await EmpData.find({ email });
    if (user.length > 0) {
      return res.json({ error: 'User Already Exist' });
    }
    const hashedPass = await bcrypt.hash(password, 10)
    const emp = new EmpData({
      name, email, password: hashedPass, isAdmin
    })
    await emp.save()
    return res.json({ message: "user added", emp })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

app.delete('/employee', async (req,res)=>{
  let {_id}= req.body
  EmpData.deleteOne({_id},(err) => {
    if (err) {
        res.json({message:"there was an error"})
    } else {
      res.json({message:'employee Removed Successfully'})
    }})
})

const port = process.env.PORT

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})