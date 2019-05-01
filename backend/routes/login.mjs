import KoaRouter from '@circuitcoder/koa-router';

import { generateJWT } from '../util';

import User from '../db/user';

const router = new KoaRouter();

router.post('/', async ctx => {
  const { email, pass } = ctx.request.body;
  const user = await User.findOne({ email });
  if(!user) return ctx.status = 403;
  if(!await user.testPass(pass)) return ctx.status = 403;

  const token = await generateJWT(user._id.toString());

  return ctx.body = { token };
});

router.put('/', async ctx => {
  if(!ctx.user.isAdmin)
    return ctx.status = 403;

  const target = ctx.request.body._id;
  const found = (await User.count({ _id: target })) > 0;

  if(!found) return ctx.status = 404;

  const token = await generateJWT(target);
  return ctx.body = { token };
});

router.get('/', async ctx => {
  ctx.body = ctx.user;
});

export default router;
