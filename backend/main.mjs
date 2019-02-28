import Koa from 'koa';
import KoaBodyparser from 'koa-bodyparser';
import KoaJWT from 'koa-jwt';
import KoaCors from '@koa/cors';

import { connect as DBConnect } from './db'; // For side effect
import User from './db/user';

import Config from './config';

const app = new Koa();
app.use(KoaCors());
app.use(KoaBodyparser());
app.use(KoaJWT({
  secret: Config.secret,
}).unless({
  custom(ctx) {
    if(ctx.path === '/login' && ctx.method === 'POST') return true;
    if(ctx.path === '/user' && ctx.method === 'POST') return true;
    return false;
  }
}));

app.use(async (ctx, next) => {
  if(ctx.state.user) {
    // TODO: verify jti
    const user = await User.findById(ctx.state.user.user, {
      status: 1,
      isAdmin: 1,
      _id: 1,
      email: 1,
      idNumber: 1,
      profile: 1,
    });

    // Hide sensitive stuff
    user.idNumber = !!user.idNumber;

    ctx.jwt = ctx.state.user;
    ctx.user = user;
    ctx.uid = user._id.toString();
  }

  await next();
});

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
