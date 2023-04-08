const mongoose=require("mongoose")
const openAccountSchema=mongoose.Schema({
    name:{type:String,require:true},
    gender:{type:String,require:true},
    dob:{type:String,require:true},
    email:{type:String,require:true},
    mobile:{type:Number,require:true},
    address:{type:String,require:true},
    balance:{type:Number,require:true},
    aadharNo:{type:Number,require:true},
    panNo:{type:String,require:true},
    isKyc:{type:Boolean,require:true},
    isClose:{type:Boolean,require:true},
    transaction:[]
})
const OpenAccountModel=mongoose.model("bank",openAccountSchema)

module.exports={
    OpenAccountModel
}