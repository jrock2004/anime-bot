import * as Koa from 'koa';
import * as Router from 'koa-router';
import { StatusCodes } from 'http-status-codes';

import AnimeResponse from './animeResponse.entity';
import Anime from './anime.entity';
import Api from '../utils/api';
import { animeQuery } from '../utils/queries';

const routerOpts: Router.IRouterOptions = {
  prefix: '/anime',
};

const router: Router = new Router(routerOpts);
const securityToken = process.env.TOKEN;
const api = new Api();

router.get('/', async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

router.get('/:anime_id', async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

router.post('/', async (ctx: Koa.Context) => {
  const { text, response_url, token } = ctx.request.body,
    variables = {
      anime: text,
    };

  let response = await api.search(variables, animeQuery);

  if (response.errors) {
    ctx.body = {
      text: `The anime ${text} was not found!`,
      response_type: 'in_channel',
    };
  } else {
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

    ctx.body = {
      text: anime,
      response_type: 'in_channel',
    };
  }
});

router.delete('/:anime_id', async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

router.patch('/:anime_id', async (ctx: Koa.Context) => {
  ctx.throw(StatusCodes.NOT_FOUND);
});

export default router;
