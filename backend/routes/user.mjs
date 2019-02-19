import KoaRouter from '@circuitcoder/koa-router';

import User from '../db/user';

import { generateJWT } from '../util';

const router = new KoaRouter();

// Register
router.post('/', async ctx => {
  const { email, pass } = ctx.request.body;

  const user = new User({ email });
  await user.setPass(pass);

  try {
    await user.save();
  } catch(e) {
    if(e.name === 'MongoError' && e.code === 11000) {
      // Duplicated
      ctx.status = 400;
      ctx.body = { err: 'duplicated' };
      return;
    }

    throw e;
  }

  const token = await generateJWT(user._id.toString());

  // TODO: directly login?

  return ctx.body = { token };
});

export default router;
