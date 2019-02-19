import Koa from 'koa';
import KoaBodyparser from 'koa-bodyparser';
import KoaJWT from 'koa-jwt';

import { connect as DBConnect } from './db'; // For side effect

import Config from './config';

const app = new Koa();
app.use(KoaBodyparser());
app.use(KoaJWT({
  secret: Config.secret,
}).unless({
  custom(ctx) {
    if(ctx.path === '/login') return true;
    if(ctx.path === '/user' && ctx.method === 'POST') return true;
    return false;
  }
}));

import { routes } from './routes';

const router = routes();
app.use(router.routes(), router.allowedMethods());

async function bootstrap() {
  await DBConnect();

  app.listen(Config.port, Config.host, () => {
    console.log(`Server up at ${Config.host}:${Config.port}`);
  });
}

bootstrap().catch(e => {
  console.error(e);
  process.exit(1);
});
