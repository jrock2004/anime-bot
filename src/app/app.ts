import * as Koa from 'koa';
import * as HttpStatus from 'http-status-codes';
import * as bodyParser from 'koa-bodyparser';

import animeController from '../anime/anime.controller';

const app:Koa = new Koa();

// Allows us to parse body from API calls
app.use(bodyParser());

// Generic error handling middleware.
app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
  try {
    await next();
  } catch (error) {
    ctx.status = error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    error.status = ctx.status;
    ctx.body = { error };
    ctx.app.emit('error', error, ctx);
  }
});

// Initial route
app.use(animeController.routes());
app.use(animeController.allowedMethods());

// Application error logging.
app.on('error', console.error);

export default app;
