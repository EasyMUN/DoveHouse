import KoaRouter from '@circuitcoder/koa-router';

import request from '../request';

import Conference from '../db/conference';
import Committee from '../db/committee';

import Config from '../config';

import mailer from '../mailer';

const router = new KoaRouter();

router.get('/:id', async ctx => {
  return ctx.body = await Conference.findById(ctx.params.id, {
    _id: 1,
    abbr: 1,
    title: 1,
    background: 1,
    desc: 1,
    logo: 1,
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

  const result = await Conference.findOneAndUpdate({
    _id: ctx.params.id,
    registrants: { $not: { $elemMatch: { user: ctx.params.user }}},
  }, {
    $push: { registrants: {
      user: ctx.params.user,
      stage: 'reg',
      reg: ctx.request.body
    }},
  });

  if(!result) return ctx.status = 404;
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

export default router;
