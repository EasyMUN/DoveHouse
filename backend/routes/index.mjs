import KoaRouter from '@circuitcoder/koa-router';

import login from './login';
import user from './user';
import conference from './conference';
import payment from './payment';

export function routes() {
  const router = new KoaRouter();

  router.use('/login', login.routes());
  router.use('/user', user.routes());
  router.use('/conference', conference.routes());
  router.use('/payment', payment.routes());

  return router;
}
