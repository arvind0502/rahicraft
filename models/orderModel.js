import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
 products:[{
    type:mongoose.ObjectId,
    ref:"Products",
 },
],
payment:{},
buyer:{
    type:mongoose.ObjectId,
    ref:"users",
},
status:{
    type:String,
    default:"not process",
    enum:["not process","processing","shipped","delivered","cancel"],
},
},{timestamps:true});


export default mongoose.model("Order",orderSchema);