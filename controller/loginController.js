const db = require("../config/db");
const axios = require('axios');
require('dotenv').config(); 
const { generateAccessToken, generateRefreshToken } = require('../auth/jwtUtils');

const sendOTP = async (req, res) => {
    const { phoneNumber } = req.body;
    const formattedPhoneNumber = `91${phoneNumber}`;

    const otp = generateRandomSixDigitNumber();
    const url = 'https://bdwamaster.online/api/send';
    const params = {
      number: formattedPhoneNumber,
      type: 'text',
      message: `Dear Customer, Your One-Time Password (OTP) for logging into SpectsGenie is: ${otp}. This OTP is valid for the next 10 minutes. Please do not share it with anyone.`,
      instance_id: process.env.INSTANCE_ID,
      access_token: process.env.WHATSAPP_ACCESS_TOKEN,
    };
  
    try {
      // Make the API call
      const response = await axios.get(url, { params });
  
      // Save the OTP to the database
      await saveOTPToDatabase(phoneNumber, otp);
  
      console.log('Message sent successfully:', response.data);
  
      // Send a response to the client
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
  
      // Handle error and send a response to the client
      res.status(500).json({
        success: false,
        error: 'Failed to send OTP. Please try again.',
      });
    }
  };

const verifyOTP = async (req, res) => {
    const { phoneNumber,otp } = req.body;
    try {
      const data = await db.query("SELECT otp,id,name FROM user_otp where mobile = ?",[phoneNumber]);
      if(!data){
          res.status(404).send({
              success: false,
              message: "Something went wrong"
          })
      }else{
        console.log(data)
       let dbOtp = data[0][0]?.otp;
       let userName = data[0][0]?.name;
       let userId = data[0][0]?.id;
       console.log(dbOtp)
       console.log(otp)
       console.log(phoneNumber)

        if(dbOtp == otp){
          const accessToken = generateAccessToken(userId,userName);
          const refreshToken = generateRefreshToken(userId,userName);
          res.status(200).send({
            success: true,
            message: "OTP verified successfully",
            accessToken: accessToken,
            refreshToken: refreshToken
        })

        }else{
          res.status(400).send({
            success: false,
            message: "Incorrect OTP",
        })
        }

      }
  } catch (error) {
      console.log(error);
      res.status(400).send({
          success: false,
          message: "Something went wrong",
          error
      })
  }

  };
  
  

function generateRandomSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
  }

 const saveOTPToDatabase = async (phoneNumber, otp) => {
    const query = 'INSERT INTO otp_tokens (phone_number, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp);';
    await db.query(query, [phoneNumber, otp, otp]);
  };

module.exports = {sendOTP, verifyOTP};