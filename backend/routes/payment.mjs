import KoaRouter from '@circuitcoder/koa-router';

import Payment from '../db/payment';

import Config from '../config';

import mailer from '../mailer';

const router = new KoaRouter();

router.get('/:id', async ctx => {
  const result = await Payment.findById(ctx.params.id).populate('conf', 'logo abbr _id title payments moderators').lean();
  if(!result) return ctx.status = 404;
  if(result.payee.toString() !== ctx.user._id.toString()
    && !ctx.user.isAdmin
    && result.conf.moderators.every(e => e.toString() !== ctx.user._id.toString())) return ctx.status = 404; // For secrutiy consideration

  result.conf.moderators = undefined;
  return ctx.body = result;
});

router.get('/ident/:ident/confirm', async ctx => {
  if(!ctx.user.isAdmin) return ctx.status = 403;

  const payments = await Payment.find({
    ident: ctx.params.ident,
  }).populate('payee', 'realname email').populate('conf', 'abbr');

  if(payments.length > 1) return ctx.body = { err: 'Duplicated ident, please confirm manually by ID' };
  else if(payments.length === 0) return ctx.body = { err: 'Ident not found' };

  const [payment] = payments;
  payment.status = 'paid';
  payment.confirmation = new Date();

  await payment.save();

  console.log(payment);

  await mailer.send(payment.payee.email, `订单确认: ${payment.desc}`, 'confirm', {
    name: payment.payee.realname,
    conf: payment.conf.abbr,

    desc: payment.desc,
    link: `${Config.frontend}/payment/${payment._id}`,
  });

  return ctx.body = { err: null };
});

export default router;
