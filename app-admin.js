const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const cronjob  = require('node-cron')
const IpPublic = 'https://icanhazip.com/';



const app = express();
const port = 2028;
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



//------------------------Server-----------------------//
app.listen(port, async() => {
    console.log(`===============[INVOICE SERVER IS RUNNING NOW]===============`);
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