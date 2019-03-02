import KoaRouter from '@circuitcoder/koa-router';

import login from './login';
import user from './user';
import conference from './conference';

export function routes() {
  const router = new KoaRouter();

  router.use('/login', login.routes());
  router.use('/user', user.routes());
  router.use('/conference', conference.routes());

  return router;
}
