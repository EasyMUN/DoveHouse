import KoaRouter from '@circuitcoder/koa-router';

import { generateJWT } from '../util';

import User from '../db/user';

const router = new KoaRouter();

router.post('/', async ctx => {
  const { email, pass } = ctx.request.body;
  const user = await User.findOne({ email });
  if(!user) return ctx.status = 404;
  if(!await user.testPass(pass)) return ctx.status = 403;

  const token = await generateJWT(user._id.toString());

  return ctx.body = { token };
});

export default router;
