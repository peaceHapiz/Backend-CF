const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const cronjob  = require('node-cron')
const IpPublic = 'https://icanhazip.com/';



const app = express();
const port = 2027;
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


// Dowload invoice
const dowloadInvoice = require('./invoice/download')




//Routes
app.get('/', dowloadInvoice)

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