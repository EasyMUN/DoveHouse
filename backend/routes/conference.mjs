import KoaRouter from '@circuitcoder/koa-router';

import request from '../request';

import Conference from '../db/conference';
import User from '../db/user';
import Committee from '../db/committee';
import Payment from '../db/payment';

import Config from '../config';

import { promisify } from 'util';
import crypto from 'crypto';
import mailer from '../mailer';

const randomBytes = promisify(crypto.randomBytes);

const router = new KoaRouter();

router.get('/', async ctx => {
  // List all open conferences
  return ctx.body = await Conference.find({
    closed: { $exists: false },
  }, {
    _id: 1,
    abbr: 1,
    title: 1,
    background: 1,
    logo: 1,
    closed: 1,
  }).lean();
});

router.get('/:id', async ctx => {
  return ctx.body = await Conference.findById(ctx.params.id, {
    _id: 1,
    abbr: 1,
    title: 1,
    background: 1,
    desc: 1,
    logo: 1,

    closed: 1,
    requiresRealname: 1,
    publishes: 1,
  });
});

router.get('/:id/committee/', async ctx => {
  ctx.body = await Committee.find({
    conference: ctx.params.id,
  }, {
    slug: 1,
    title: 1,
    abbr: 1,
    subject: 1,
    background: 1,

    special: 1,
    targets: 1,
  });
});

router.get('/:id/committee/:cid', async ctx => {
  ctx.body = await Committee.findOne({
    slug: ctx.params.cid,
    conference: ctx.params.id,
  }, {
    slug: 1,
    title: 1,
    abbr: 1,
    subject: 1,
    background: 1,

    special: 1,
    targets: 1,
  });
});

router.put('/:id/registrant/:user', async ctx => {
  const allowed = ctx.user.isAdmin || ctx.params.user === ctx.user._id.toString();
  if(!allowed) return ctx.status = 403;

  const conf = await Conference.findById(ctx.params.id, { requiresRealname: 1 });
  const user = await User.findById(ctx.params.user);
  if(!user) return ctx.status = 400;
  let flag = true;

  if(!user.profile) flag = false;
  if(conf.requiresRealname && !user.idNumber) flag = false;
  if(!flag) return ctx.status = 400;

  const result = await Conference.findOneAndUpdate({
    _id: ctx.params.id,
    registrants: { $not: { $elemMatch: { user: ctx.params.user }}},
  }, {
    $push: { registrants: {
      user: ctx.params.user,
      stage: 'reg',
      reg: ctx.request.body.reg,
      extra: ctx.request.body.extra,
    }},
  }, { fields: {
    webhooks,
  }});

  if(!result) return ctx.status = 404;

  // TODO: Send webhooks

  return ctx.status = 201;
});

router.get('/:id/registrant/:user', async ctx => {
  const allowed = ctx.user.isAdmin || ctx.params.user === ctx.user._id.toString();
  if(!allowed) return ctx.status = 403;

  const conf = await Conference.findOne({
    _id: ctx.params.id,
    'registrants.user': ctx.params.user,
  }, {
    'registrants.$': 1
  });

  if(!conf) return ctx.status = 404;
  return ctx.body = { stage: conf.registrants[0].stage, reg: conf.registrants[0].reg };
});

router.get('/:id/payment/:user', async ctx => {
  const allowed = ctx.user.isAdmin || ctx.params.user === ctx.user._id.toString();
  if(!allowed) return ctx.status = 403;

  return ctx.body = await Payment.find({
    conf: ctx.params.id,
    payee: ctx.params.user,
  }).sort({ creation: -1 }).lean();
});

router.get('/:id/role/:user', async ctx => {
  const allowed = ctx.user.isAdmin || ctx.params.user === ctx.user._id.toString();
  if(!allowed) return ctx.status = 403;

  const conf = await Conference.findOne({
    _id: ctx.params.id,
    moderators: ctx.params.user,
  });

  if(!conf) return ctx.status = 404;
  return ctx.body = { role: 'moderator' };
});

router.post('/:id/publish', async ctx => {
  const criteria = {
    _id: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference.findOneAndUpdate(criteria, { $push: {
    publishes: {
      title: ctx.request.body.title,
      main: ctx.request.body.main,

      date: new Date().toISOString(),
    },
  }});

  if(conf) return ctx.status = 201;
  else return ctx.status = 404;
});

router.get('/:id/stat', async ctx => {
  const criteria = {
    _id: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference.findOne(criteria, { webhooks: 1, 'registrants._id': 1 });

  if(!conf) return ctx.status = 404;

  const paymentCount = await Payment.count({
    conf: ctx.params.id,
  });

  return ctx.body = {
    regCount: conf.registrants.length,
    paymentCount,
    webhooks: conf.webhooks,
  };
});

router.get('/:id/list', async ctx => {
  const criteria = {
    _id: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference
    .findOne(criteria, { registrants: 1 })
    .populate('registrants.user', 'email realname profile phone')
    .lean();

  if(!conf) return ctx.status = 404;

  return ctx.body = conf.registrants;
});

router.get('/:id/list/:uid', async ctx => {
  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference
    .findOne(criteria, { 'registrants.$': 1 })
    .populate('registrants.user', 'email realname profile phone')
    .lean();

  if(!conf) return ctx.status = 404;

  return ctx.body = conf.registrants[0];
});

router.put('/:id/list/:uid/tags', async ctx => {
  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  // TODO: sanitize body
  const conf = await Conference
    .findOneAndUpdate(criteria, { $set: { 'registrants.$.tags': ctx.request.body }})
    .lean();

  if(!conf) return ctx.status = 404;
  return ctx.status = 201;
});

router.post('/:id/list/:uid/payment', async ctx => {
  const { total, desc, detail, discounts: _dis } = ctx.request.body;
  const discounts = _dis || [];

  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference.findOne(criteria, { abbr: 1 });
  if(!conf) return ctx.status = 403;

  const user = await User.findById(ctx.params.uid, { email: 1, realname: 1 });

  const ident = (parseInt((await randomBytes(4)).toString('hex'), 16) % 1000000).toString().padStart(6, '0');

  const { _id } = await Payment.create({
    conf: ctx.params.id,
    payee: ctx.params.uid,
    ident,

    total, desc, detail, discounts,

    status: 'waiting',
    creation: new Date(),
    confirmation: null,
  });

  const discount = discounts.reduce((acc, e) => acc + e.amount, 0);
  const pricing = discount > 0 ? `${total} - ${discount} = ${total - discount}` : `${total}`;

  await mailer.send(user.email, `新订单: ${desc}`, 'payment', {
    name: user.realname,
    conf: conf.abbr,

    desc, pricing, detail,
    link: `${Config.frontend}/payment/${_id}`,
  });

  return ctx.body = { _id };
});

router.put('/:id/webhooks', async ctx => {
  const criteria = {
    _id: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference.findOneAndUpdate(criteria, {
    $set: { webhooks: ctx.request.body },
  });

  if(!conf) return ctx.status = 404;
  return ctx.status = 204;
});

export default router;
