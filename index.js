require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns')
const url = require('url')
let bodyParser = require('body-parser')
let mongoose = require('mongoose')
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;
var urls = [];

const urlSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true
  },
  count: Number
});

let UrlModel = mongoose.model('UrlModel', urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  let link = req.body.url
  console.log('POST link: ', link)

  if(!link)
    return res.json(
      {"error": "Invalid URL"}
    )

  let urlParse = url.parse(link)
  //console.log('urlParse :', urlParse)

  if(1==2 &&!urlParse.hostname)
    return res.json(
      {"error": "Invalid URL"}
    )
  
  dns.lookup(urlParse.hostname + "",async (err, originalUrl) => {
    if(err)
      return res.json(
        {"error": "Invalid URL"}
      )
    
    urls.push({
      link: link,
      ip: originalUrl
    });

    let count = await UrlModel.countDocuments({});
    await (new UrlModel({
      link,
        count
    })).save()
    
    console.log('urls post :', urls)
    res.json({
      original_url: link,
           short_url: count
             });
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  let shortId = req.params.short_url
  console.log('GET shortId :', shortId)

  const document = await UrlModel.findOne({count: +shortId})
  
  if(!document)
    return res.json({
    "error": "No short URL found for the given input"
    })
  res.redirect(document.link)
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
