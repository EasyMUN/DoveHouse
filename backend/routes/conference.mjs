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

export default router;
