 const express = require('express')
 const prisma = require('../../model/model')
 const router = express.Router()
const axios = require('axios')
const nodemailer = require('nodemailer')
const { Role } = require('@prisma/client')


function generateRandomId(role, registrationDate) {
    let result = "";
    const characters = "1234567890";
    const charactersLength = characters.length;
  
    // Format tanggal pendaftaran (YYYYMMDD)
    const date = new Date(registrationDate);
    const formattedDate = date.getFullYear().toString() +
                          String(date.getMonth() + 1).padStart(2, "0") +
                          String(date.getDate()).padStart(2, "0");
  
    // Generate angka acak sebanyak 5 digit
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    // Pastikan angka tidak dimulai dari 0
    if (result.startsWith("0")) {
      result = result.replace("0", "1");
    }
  
    // Format sesuai role
    if (role.toLowerCase() === "pelajar") {
      return `P-${formattedDate}-${result}`;
    } else if (role.toLowerCase() === "guru"){
      return `G-${formattedDate}-${result}`; // Format default untuk role lain
    } else if (role.toLowerCase() === "mahasiswa"){
        return `M-${formattedDate}-${result}`; // Format default untuk role lain
    }
  }
  

  
router.post('/register', async(req,res) => {
    const {name, username,email, password, checkpassword, phoneNumber, role } = req.body

    if (
        role !== "guru" &&
        role !== "pelajar" &&
        role !== "mahasiswa"
    ){
        return res.status(422).json({code : 422, message: "invalid role"})
    }

    if(!name) {
        return res
          .status(422)
          .json({ code: 422, message: "Please fill all the fields, need parameter (name)" });
    }

    if (!username) {
        return res
          .status(422)
          .json({ code: 422, message: "Please fill all the fields, need parameter (username)" });
    }

    if (!email) {
        return res
          .status(422)
          .json({ code: 422, message: "Please fill all the fields, need parameter (email)" });
    } 

    if (!phoneNumber) {
        return res
          .status(422)
          .json({ code: 422, message: "Please fill all the fields, need parameter (phone)" });
    }

    if (!password) {
        return res
          .status(422)
          .json({ code: 422, message: "Please fill all the fields, need parameter (password)" });
    }

    if (!checkpassword) {
        return res
          .status(422)
          .json({ code: 422, message: "Please fill all the fields, need parameter (repassword)" });
    }

    if (!role) {
        return res
          .status(422)
          .json({ code: 422, message: "Please fill all the fields, need parameter (role)" });
    }

    const User = await prisma.user.findFirst({
        where: { username: username },
      });
    
    const Email = await prisma.user.findUnique({
        where : {email : email}
    })

    const Phone  = await prisma.user.findFirst({
        where : {phoneNumber : phoneNumber}
    })

    if (User){
        return res
        .status(420)
        .json({code : 420, message : "Username sudah terdaftar"})
    }
    if (Email){
        return res
        .status(420)
        .json({code : 420, message : "Email sudah terdaftar"})
    }
    if (Phone){
        return res
        .status(420)
        .json({code : 420, message : "Phone sudah terdaftar"})
    }

    if (password.length < 8) {
        return res
          .status(426)
          .json({ code: 426, message: "Password must be at least 8 characters" });
    }

    if (!password.match(/[a-z]/g)) {
        return res.status(427).json({
          code: 427,
          message: "Password must contain at least one lowercase letter",
        });
    }

    if (!password.match(/[A-Z]/g)) {
        return res.status(428).json({
          code: 428,
          message: "Password must contain at least one uppercase letter",
        });
    }

    if (!password.match(/[0-9]/g)) {
        return res.status(429).json({
          code: 429,
          message: "Password must contain at least one number",
        });
    }

    if (password !== checkpassword) {
        return res
          .status(433)
          .json({ code: 430, message: "Password not match" });
    }

    if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res
          .status(430)
          .json({ code: 430, message: "Invalid email address" });
    }
    
    const now = new Date()
    const UUID = generateRandomId(role,now)



    const expiresOtp = new Date(now);
    expiresOtp.setDate(now.getMinutes() + 5);

    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
      }
    
    const insertUser = await prisma.user.create({
        data : {
            id :UUID,
            name : name,
            username : username,
            email : email,
            password : password,
            phoneNumber : phoneNumber,
            role : role,
            createdAt : now,
            verified : false,
            otp : {
                create : {
                    code :  generateOTP(),
                    expiresAt : expiresOtp,
                    createdAt : now
                }
            }
        }
    })


    res.status(200).json({code : 200, message : "Register Succesfull", data: insertUser})
})

module.exports = router
  