import KoaRouter from '@circuitcoder/koa-router';

import login from './login';
import user from './user';

export function routes() {
  const router = new KoaRouter();

  router.use('/login', login.routes());
  router.use('/user', user.routes());

  return router;
}
