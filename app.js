const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const cronjob  = require('node-cron')



const app = express();
const port = 2025;
const IpPrivate = require("ip");


const myIpPrivate = IpPrivate.address();

//Admin
//User Action
const getAllUser = require("./admin/user/getAllUser")
const changeToAdmin = require('./admin/user/changeToAdmin')

//Sponsor Action
const addSponsor = require('./admin/sponsor/addSponsor')
const updateSponsor = require('./admin/sponsor/updateSponsor')
const deleteSponsor = require('./admin/sponsor/deleteSponsor')

//Ticket Action
const updateTicket = require('./admin/ticket/updateTicket')
const deleteTicket = require('./admin/ticket/deleteTicket')
const addTicket = require('./admin/ticket/addTicket')


//User Controller
const loginController = require('./src/controller/user_controller/loginController')
const registerController = require('./src/controller/user_controller/registerController')
const logoutController = require('./src/controller/user_controller/logoutController')
const manualVerif = require('./src/controller/user_controller/verifManual')

//Ticket Controller
const buyTicket = require('./src/controller/tiket_controller/buyTicket')





//Function
const midtransWebHook = require('./src/function/midtrans-webhook')
const sessionWacther = require('./src/function/sessionWatcher')
const otpWatcher = require('./src/function/otpWatcher')


//cronjob
setInterval(async () => {
    console.log("Interval berjalan...");
    await sessionWacther()
    await otpWatcher();
    await midtransWebHook();
}, 3 * 60 * 1000); // Setiap 5 menit




//-----------------Configuration------------------//
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.enable('trust proxy');
app.set('view engine', 'ejs');

//------------------------Routes-----------------------//

//Admin Routes
app.use('/api/admin/user', getAllUser)
app.use('/api/admin/user', changeToAdmin)
app.use('/api/admin/sponsor', addSponsor)
app.use('/api/admin/sponsor', updateSponsor)
app.use('/api/admin/sponsor', deleteSponsor)
app.use('/api/admin/tiket', addTicket)
app.use('/api/admin/tiket', updateTicket)
app.use('/api/admin/tiket', deleteTicket)

//User Routes
app.use('/api', loginController)
app.use('/api', registerController)
app.use('/api',logoutController)
app.use('/api', manualVerif)

//Ticket Routes
app.use('/api', buyTicket)



//------------------------Server-----------------------//
app.listen(port, async() => {
    console.log(`===============[SERVER IS RUNNING NOW]===============`);
    console.log(`❍ Port: ${port}`);
    console.log(`❍ Ip Private: ${myIpPrivate}`);
    console.log(`=====================================================`);
});