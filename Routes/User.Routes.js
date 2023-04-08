const express = require("express");
const { OpenAccountModel } = require("../models/UserModels");
const userRoute = express.Router();

userRoute.get("/", async(req, res) => {
    const {email,panNo}=req.query
    const data = await OpenAccountModel.find({ email: email, panNo, panNo });
 try{
        if(data.length>0){
            res.status(201).json({data:data[0]})
        }else{
            res.status(401).json({message:"Please Open your account"})
        }
 }catch(err){
    console.log("err", err);
    res.status(401).json({ message: err });
 }
});

userRoute.post("/openAccount", async (req, res) => {
  const {
    name,
    gender,
    dob,
    email,
    mobile,
    address,
    balance,
    aadharNo,
    panNo,
  } = req.body;
  try {
    const checkDuplicate = await OpenAccountModel.find({
      email: email,
      panNo: panNo,
    });
    if (checkDuplicate.length > 0) {
      res
        .status(401)
        .json({ message: "User Already Exist With Same Email And Pan Number" });
    } else {
      const newUser = new OpenAccountModel({
        name,
        gender,
        dob,
        email,
        mobile,
        address,
        balance,
        aadharNo,
        panNo,
        isKyc: false,
        isClose: false,
      });
      await newUser.save();
      res.status(201).json({ message: "New Account successfully Created" });
    }
  } catch (err) {
    console.log("err", err);
    res.status(401).json({ message: err });
  }
});

userRoute.patch("/updateKYC", async (req, res) => {
  const { name,  email, mobile, aadharNo, panNo } = req.body;
  try {
    const data = await OpenAccountModel.find({ email: email, panNo, panNo });
    if (data.length > 0) {
      if (
        data[0].name === name &&
        data[0].mobile === mobile &&
        data[0].aadharNo === aadharNo
      ) {
        let id = data[0]._id;
        await OpenAccountModel.findByIdAndUpdate(id, { isKyc: true });
        res.status(201).json({ message: "KYC done" });
      } else {
        res.status(401).json({ message: "Details Not Match With Database" });
      }
    } else {
      res.status(401).json({ message: "Details Not Match With Database" });
    }
  } catch (err) {
    console.log("err", err);
    res.status(401).json({ message: err });
  }
});

userRoute.patch("/depositMoney", async (req, res) => {
  const { email, panNo, Amount } = req.body;
  try {
    const data = await OpenAccountModel.find({ email: email, panNo, panNo });
    if (data.length > 0) {
      if(!data[0].isClose){
        let id = data[0]._id;
      await OpenAccountModel.findByIdAndUpdate(id, {
        balance: data[0].balance + Amount,
        transaction: [
          ...data[0].transaction,
          {
            type: "Deposite",
            DepositeBy:"self",
            Amount: Amount,
            Balance: data[0].balance + Amount,
          },
        ],
      });
      res.status(201).json({ message: "Deposite money done" });
      }else{
        res.status(401).json({ message: "Your Account is Closed Please Contact Bank" });
      }
    } else {
      res.status(401).json({ message: "Details Not Match With Database" });
    }
  } catch (err) {
    console.log("err", err);
    res.status(401).json({ message: err });
  }
});

userRoute.patch("/withdrawMoney", async (req, res) => {
  const { email, panNo, Amount } = req.body;
  try {
    const data = await OpenAccountModel.find({ email: email, panNo, panNo });
    if (data.length > 0) {
      if(!data[0].isClose){
        if (data[0].balance < Amount) {
            res
              .status(401)
              .json({
                message: "Your Balance amount is less than withdrawal amount",
              });
          } else {
            let id = data[0]._id;
            await OpenAccountModel.findByIdAndUpdate(id, {
              balance: data[0].balance - Amount,
              transaction: [
                ...data[0].transaction,
                {
                  type: "Withdraw",
                  Amount: Amount,
                  Balance: data[0].balance - Amount,
                },
              ],
            });
            res.status(201).json({ message: "Withdraw money done" });
          }
      }else{
        res.status(401).json({ message: "Your Account is Closed Please Contact Bank" });
      }
    } else {
      res.status(401).json({ message: "Details Not Match With Database" });
    }
  } catch (err) {
    console.log("err", err);
    res.status(401).json({ message: err });
  }
});

userRoute.patch("/transferMoney", async (req, res) => {
  const { email, panNo, Amount, toName, toEmail, toPanNo } = req.body;
  try {
    const data = await OpenAccountModel.find({ email: email, panNo, panNo });
    const data2 = await OpenAccountModel.find({
      email: toEmail,
      panNo: toPanNo,
    });
    if (data.length > 0 && data2.length > 0) {
        if(!data[0].isClose && !data2[0].isClose){
            if (data[0].balance < Amount) {
                res
                  .status(401)
                  .json({
                    message: "Your Transfer amount is less than withdrawal amount",
                  });
              } else {
                let id = data[0]._id;
                await OpenAccountModel.findByIdAndUpdate(id, {
                  balance: data[0].balance - Amount,
                  transaction: [
                    ...data[0].transaction,
                    {
                      type: "Transfer",
                      Amount: Amount,
                      Balance: data[0].balance - Amount,
                    },
                  ],
                });
        
                let id2 = data2[0]._id;
                await OpenAccountModel.findByIdAndUpdate(id2, {
                  balance: data2[0].balance + Amount,
                  transaction: [
                    ...data2[0].transaction,
                    {
                      type: "Deposite",
                      Amount: Amount,
                      DepositeBy:toName,
                      Balance: data2[0].balance + Amount,
                    },
                  ],
                });
        
                res.status(201).json({ message: "Transfer money done" });
              }
        }else{
            res.status(401).json({ message: "Your Account is Closed Please Contact Bank" });
        }
    } else {
      res.status(401).json({ message: "Details Not Match With Database" });
    }
  } catch (err) {
    console.log("err", err);
    res.status(401).json({ message: err });
  }
});

userRoute.patch("/closeAccount", async (req, res) => {
  const { id } = req.body();
  try {
    await OpenAccountModel.findByIdAndUpdate(id, { isClose: true });
    res.status(201).json({ message: "Account has been closed successfully" });
  } catch (err) {
    console.log("err", err);
    res.status(401).json({ message: err });
  }
});

module.exports = {
  userRoute,
};
