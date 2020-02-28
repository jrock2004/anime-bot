"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const anime = require("./models/anime");
const config = require("./config");
const internalRequests = require("./utils/api");

/**
 *  Does an API lookup to ANN and returns information for the requested anime
 *  @req - Request
 *  @res - Response
 *
 *  Returns a json object to mattermost
 */
router.post("/anime", (req, res) => {
  // Populate the anime object
  let animeObj = new anime({
    searchTerm: req.body.text,
    animeToken: config.token,
    jsonResponse: {
      text: '',
      'response_type': 'in_channel'
    }
  });

  console.log(animeObj);
  console.log('------');
  console.log(req);
  console.log('------');
  console.log(res);
  
  
  // Check if token match
  if (animeObj.animeToken.indexOf(req.body.token) > -1) {
    let apiObj = new internalRequests(animeObj, req, res);
    // let apiObj = new internalRequests();

    apiObj.searchAnime();
  } else {
    animeObj.jsonResponse.text = 'Token does not match';

    res.send(animeObj.jsonResponse);
  }
});

// router.get("/", (req, res) => {
//   res.writeHead(200, { "Content-Type": "text/html" });
//   res.write("<h1>Hello from Express.js!</h1>");
//   res.end();
// });
// router.get("/another", (req, res) => res.json({ temp: 1 }));
// router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

module.exports = app;
module.exports.handler = serverless(app);
