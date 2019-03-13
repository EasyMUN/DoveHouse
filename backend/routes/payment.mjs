import KoaRouter from '@circuitcoder/koa-router';

import request from '../request';

import Payment from '../db/payment';

import Config from '../config';

const router = new KoaRouter();

router.get('/:id', async ctx => {
  const result = await Payment.findById(ctx.params.id).populate('conf', 'logo abbr _id title payments moderators').lean();
  if(!result) return ctx.status = 404;
  if(result.payee.toString() !== ctx.user._id.toString()
    && !ctx.user.isAdmin
    && result.conf.moderators.every(e => e.toString() !== ctx.user._id.toString())) return ctx.status = 404; // For secrutiy consideration
  return ctx.body = result;
});

router.post('/:id', async ctx => {
  const payment = await Payment.findById(ctx.params.id).populate('conf', 'moderators').lean();

  // We never mutate conf of a payment, so this is thread safe
  if(!payment) return ctx.status = 404;
  if(!ctx.user.isAdmin && result.conf.moderators.every(e => e.toString() !== ctx.user._id.toString()))
    return ctx.status = 404;

  const { status } = ctx.request.body;

  payment.status = status;
  if(status === 'paid')
    payment.confirmation = new Date();
  await payment.save();

  return ctx.status = 201;
});

export default router;
