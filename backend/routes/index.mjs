import KoaRouter from '@circuitcoder/koa-router';

import login from './login';
import user from './user';
import conference from './conference';
import payment from './payment';
import assignment from './assignment';
import interview from './interview';

export function routes() {
  const router = new KoaRouter();

  router.use('/login', login.routes());
  router.use('/user', user.routes());
  router.use('/conference', conference.routes());
  router.use('/payment', payment.routes());
  router.use('/assignment', assignment.routes());
  router.use('/interview', interview.routes());

  return router;
}
