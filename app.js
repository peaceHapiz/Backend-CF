const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const cronjob  = require('node-cron')
const IpPublic = 'https://icanhazip.com/';



const app = express();
const port = 2025;
const IpPrivate = require("ip");

async function getIpPublic() {
    return new Promise(async(resolve, reject) => {
        try {
            const response = await axios.get(IpPublic);
            resolve(response.data.trim()); 
        } catch (error) {
            reject(error);
        }
    });
}

//-----------------Configuration------------------//
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.enable('trust proxy');
app.set('view engine', 'ejs');

const myIpPrivate = IpPrivate.address();

//Admin
//User Action
const getAllUser = require("./admin/user/getAllUser")
const changeToAdmin = require('./admin/user/changeToAdmin')
const secondVerified = require('./admin/user/second_verified')

//Sponsor Action
const addSponsor = require('./admin/sponsor/addSponsor')
const updateSponsor = require('./admin/sponsor/updateSponsor')
const deleteSponsor = require('./admin/sponsor/deleteSponsor')

//Ticket Action
const updateTicket = require('./admin/ticket/updateTicket')
const deleteTicket = require('./admin/ticket/deleteTicket')
const addTicket = require('./admin/ticket/addTicket')
const getTicketSucces = require('./admin/ticket/get-tiket-success')
const manualScanned = require('./admin/ticket/manualScanned.js')
const getAllTicket = require('./admin/ticket/get-all-ticket.js')
const changeStatus = require('./admin/ticket/activeAndDeactiveTicket.js')

//Request Data
const getExcel = require('./admin/requestData/excelTicket.js')

//User Controller
const loginController = require('./src/controller/user_controller/loginController')
const registerController = require('./src/controller/user_controller/registerController')
const logoutController = require('./src/controller/user_controller/logoutController')
const manualVerif = require('./src/controller/user_controller/verifManual')
const getOtp = require('./src/controller/validation/getOtpController')
const verifyOtp = require('./src/controller/validation/verifyOtpController')
const requestForgotPassword = require('./src/controller/user_controller/requestForgotPassword.js')
const verifyForgotPassword = require('./src/controller/user_controller/verifyForgotPassword.js')
const sendDocument = require('./src/controller/validation/send_dokumen.js')
const allRequestVerified = require('./src/controller/validation/request_add_verified.js')

//Ticket Controller
const buyTicket = require('./src/controller/tiket_controller/buyTicket')
const checkTicket = require('./src/controller/tiket_controller/checkHaveTicket.js')
const getTicket = require('./src/controller/tiket_controller/getTiket.js')
const downloadInvoice = require('./src/controller/tiket_controller/dowload-invoice.js')




//Function
const midtransWebHook = require('./src/function/midtransWebhook.js')
const sessionWacther = require('./src/function/sessionWatcher')
const otpWatcher = require('./src/function/otpWatcher')
const forgotPassword = require('./src/function//forgotPassword.js');
const { send } = require('process');


//cronjob
cronjob.schedule('*/1 * * * *', async() => {
    try {
        await midtransWebHook();
    } catch (error) {
        console.error("[CRON] Error in midtransWebHook:", error);
    }

    try {
        await sessionWacther();
    } catch (error) {
        console.error("[CRON] Error in sessionWacther:", error);
    }

    try {
        await otpWatcher();
    } catch (error) {
        console.error("[CRON] Error in otpWatcher:", error);
    }

    try {
        await forgotPassword();
    } catch (error) {
        console.error("[CRON] Error in forgotPassword:", error);
    }
});
cronjob.schedule('*/1 * * * *', () => {
    console.log(`[CRON] Job executed at: ${new Date().toISOString()}`);
});






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
app.use('/api/admin/tiket', getExcel)
app.use('/api/admin/tiket', getTicketSucces)
app.use('/api/admin/tiket', manualScanned)
app.use('/api/admin/tiket', getAllTicket)
app.use('/api/admin/tiket', changeStatus)
app.use('/api/admin/user', secondVerified)


//User Routes
app.use('/api', loginController)
app.use('/api', registerController)
app.use('/api',logoutController)
app.use('/api', manualVerif)
//app.use('/api', getOtp)
app.use('/api', verifyOtp)
app.use('/api', requestForgotPassword)
app.use('/api', verifyForgotPassword)
app.use('/api', sendDocument)
app.use('/api', allRequestVerified)

//Ticket Routes
app.use('/api', buyTicket)
app.use('/api', checkTicket)
app.use('/api', getTicket)
app.use('/api', downloadInvoice)
// app.use('/', midtransWebHook)


//------------------------Server-----------------------//
app.listen(port, async() => {
    console.log(`===============[SERVER IS RUNNING NOW]===============`);
    console.log(`❍ Port: ${port}`);
    console.log(`❍ Url: http://${myIpPrivate}:${port}`);
    try {
        const publicIp = await getIpPublic();
        console.log(`❍ Ip Public: ${publicIp}`);
      } catch (error) {
        console.error(`Error getting public IP: ${error.message}`);
      }
    console.log(`❍ Ip Private: ${myIpPrivate}`);
    console.log(`=====================================================`);
});