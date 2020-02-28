'use strict';
const express = require('express'),
  path = require('path'),
  serverless = require('serverless-http'),
  app = express(),
  bodyParser = require('body-parser'),
  router = express.Router(),
  AnimeModel = require('./models/anime'),
  config = require('./config'),
  internalRequests = require('./utils/api');

// This is used to parse the calls coming in
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

/**
 *  Does an API lookup to https://anilist.co and returns information for the requested anime
 *  @req - Request
 *  @res - Response
 *
 *  Returns a json object to mattermost
 */
router.post('/anime', (req, res) => {
  let anime = new AnimeModel({
    searchTerm: req.body.text,
    animeToken: config.token,
    jsonResponse: {
      text: '',
      response_type: 'in_channel',
    },
  });

  // Check if token match
  if (anime.animeToken.indexOf(req.body.token) > -1) {
    let requests = new internalRequests(anime, req, res);

    requests.searchAnime();
  } else {
    anime.jsonResponse.text = 'Token does not match';

    res.send(anime.jsonResponse);
  }
});

app.use('/.netlify/functions/server', router); // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
