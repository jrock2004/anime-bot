import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

import animeModel from '../models/anime';
import internalRequests from '../utils/api';

export default function expressApp() {
  const app = express(),
    router = express.Router(),
    securityToken = process.env.TOKEN || uuidv4();

  router.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Set router base path for local dev
  const routerBasePath = process.env.NODE_ENV === 'dev' ? `/` : `/.netlify/functions/`;

  // Route stuff goes here
  router.post('/anime', async (req, res) => {
    let { text, token } = req.body;

    console.log('ENV Token', process.env.TOKEN);
    console.log('Token var', securityToken);
    console.log('Req Body: ', req.body);
    console.log('Req Token: ', token);

    let anime = new animeModel({
      searchTerm: text,
    });

    // Check if token match
    if (securityToken.indexOf(token) > -1) {
      let requests = new internalRequests(anime, req, res);

      const response = await requests.searchAnime();

      anime.jsonResponse.text = response;

      res.send(anime.jsonResponse);
    } else {
      anime.jsonResponse.text = 'Token does not match';

      res.send(anime.jsonResponse);
    }
  });

  // Setting the base route
  app.use(routerBasePath, router);

  // Apply some middlewares
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  return app;
}
