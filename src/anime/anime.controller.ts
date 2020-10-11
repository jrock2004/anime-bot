import * as Koa from 'koa';
import * as Router from 'koa-router';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import Anime from './anime.entity';
import Api from '../utils/api';
import { animeQuery } from '../utils/queries';
import {
  getBannerImage,
  getTitle,
  getDescription,
  getNextEpisode,
  getGenres,
  getExternalLinks,
  getSource,
} from '../utils/helpers';

const routerBasePath = process.env.NODE_ENV === 'dev' ? `/` : `/.netlify/functions/`;

const routerOpts: Router.IRouterOptions = {
  prefix: `${routerBasePath}anime`,
};

const router: Router = new Router(routerOpts);
const securityToken = process.env.TOKEN || uuidv4();
const api = new Api();

router.get(`/`, async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

router.get('/:anime_id', async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

router.post('/', async (ctx: Koa.Context) => {
  const { text, response_url, token } = ctx.request.body,
    variables = {
      anime: text,
    },
    isMarkdown = response_url.indexOf('slack') > -1 ? false : true;

  if (securityToken.indexOf(token) === -1) {
    ctx.throw(StatusCodes.UNAUTHORIZED);

    return;
  }

  let response = await api.search(variables, animeQuery);

  if (response.errors) {
    ctx.body = {
      text: `The anime ${text} was not found!`,
      response_type: 'in_channel',
    };

    return;
  }

  let json = response.data.Media;
  let anime = new Anime();

  anime.id = json.id;
  anime.bannerImage = json.bannerImage;
  anime.title = json.title;
  anime.status = json.status;
  anime.description = json.description;
  anime.nextAiringEpisode = json.nextAiringEpisode;
  anime.episodes = json.episodes;
  anime.genres = json.genres;
  anime.externalLinks = json.externalLinks;

  // Lets start building the response
  let responseText = setResponse(anime, isMarkdown);

  ctx.body = {
    text: responseText,
    response_type: 'in_channel',
  };
});

router.delete('/:anime_id', async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

router.patch('/:anime_id', async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

const setResponse = (anime: Anime, isMarkdown: boolean): string => {
  let responseText = '';

  responseText += getBannerImage(anime, isMarkdown);
  responseText += getTitle(anime, isMarkdown);
  responseText += getDescription(anime);
  responseText += getNextEpisode(anime, isMarkdown);
  responseText += getGenres(anime, isMarkdown);
  responseText += getExternalLinks(anime, isMarkdown);
  responseText += getSource(isMarkdown);

  return responseText;
};

export default router;
