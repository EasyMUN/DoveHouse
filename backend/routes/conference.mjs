import KoaRouter from '@circuitcoder/koa-router';

import request from '../request';

import Conference from '../db/conference';

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

export default router;
