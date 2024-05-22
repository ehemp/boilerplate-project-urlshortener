require('dotenv').config();
var bodyParser = require('body-parser');
const dns = require('node:dns');
const options = {
  family: 4,
  hints: dns.ADDRCONFIG | dns.V4MAPPED, 
  all: true
}
var https = require('https');
const express = require('express');
const cors = require('cors');
const { hostname } = require('node:os');
const app = express();
const hostList = new Set();
let routePath = /\/api\/shorturl?/;
const routePathNum = /\/api\/shorturl\/[0-9]*/g;
// Basic Configuration
const port = process.env.PORT || 3000;
const urlEnd = /^(?:.(com|net|org|gov))+/;
let hostObject = {};

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))
//app.use(https);
app.use('/public', express.static(`${process.cwd()}/public`));







app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.route('/api/shorturl').post(function(req, res){


  var {url: hostName} = req.body;
  var errorMsg = { 'error': 'invalid url'};

    if (hostName.match(/https?:\/\//i)) {
    
    dns.lookup(hostName.replace(/https?:\/\//i, ''), options, (err, address) => {
      //if (err) { return res.json("DNS lookup: " + errorMsg)};
      if (err && hostName.includes('localhost')) {
        console.log('Error and hostname')
        hostObject = {url: hostName};
        hostList.add(hostObject);
      req.indexIP = [...hostList].indexOf(hostObject)
      console.log('address: %j hostList: %j', [...hostList], hostList.size, req.indexIP)
      req.showObject = {original_url: req.body.url, short_url: req.indexIP}
      res.json(req.showObject)
      } else {
        return console.log(err)
      }
      if (!err) {
        hostObject = {url: hostName/*, ip: address[0].address*/}
    //if (err) {return console.log(err)}
      hostList.add(hostObject);
      req.indexIP = [...hostList].indexOf(hostObject)
      console.log('address: %j hostList: %j', address, [...hostList], hostList.size, req.indexIP)
      req.showObject = {original_url: hostName, short_url: req.indexIP}
      res.json({original_url: hostName, short_url: req.indexIP})
      }
      

    })
  } else {

    return res.json(errorMsg)  
  }

  app.get(routePathNum, (req, res) => {
    //console.log(req.path.slice(14))
    //if (err) {return console.log("GET error: " + err)}
    console.log("Handler for re-route: hostList: %j hostObject: %j", [...hostList], [...hostList].indexOf(hostObject))
    if (req.path.slice(14) === [...hostList].indexOf(hostObject).toString()) {
      //console.log(hostObject.url)
      res.redirect(hostObject.url)
    } else {
      console.log("Re-route Error")
      return res.send('Short url not in database')
    }
  })


})




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
