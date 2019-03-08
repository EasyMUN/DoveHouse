import KoaRouter from '@circuitcoder/koa-router';

import request from '../request';

import Payment from '../db/payment';

import Config from '../config';

const router = new KoaRouter();

router.get('/:id', async ctx => {
  const result = await Payment.findById(ctx.params.id).populate('conf', 'logo abbr _id title payments').lean();
  if(!result) return ctx.status = 404;
  if(result.payee.toString() !== ctx.user._id.toString() && !ctx.user.isAdmin) return ctx.status = 404; // For secrutiy consideration
  return ctx.body = result;
});

export default router;
