import KoaRouter from '@circuitcoder/koa-router';

import Assignment from '../db/assignment';

import Config from '../config';

const router = new KoaRouter();

router.get('/:id', async ctx => {
  const result = await Assignment.findById(ctx.params.id)
    .populate('conf', 'logo abbr _id title payments moderators')
    .populate('assignee', 'realname email')
    .lean();
  if(!result) return ctx.status = 404;
  if(result.assignee._id.toString() !== ctx.user._id.toString()
    && !ctx.user.isAdmin
    && result.conf.moderators.every(e => e.toString() !== ctx.user._id.toString())) return ctx.status = 404; // For secrutiy consideration

  result.conf.moderators = undefined;
  return ctx.body = result;
});

router.put('/:id/ans', async ctx => {
  const { ans } = ctx.request.body;
  if(!ans) return ctx.status = 400;

  const assignment = await Assignment.findOneAndUpdate({
    _id: ctx.params.id,
    assignee: ctx.user._id,
  }, {
    $set: { ans },
  });

  if(!assignment) return ctx.status = 404;
  return ctx.status = 201;
});

router.put('/:id/submitted', async ctx => {
  if(!ctx.request.body.submitted) return ctx.status = 400; // One-way trapdoor

  const assignment = await Assignment.findOneAndUpdate({
    _id: ctx.params.id,
    assignee: ctx.user._id.toString(),
  }, {
    $set: { submitted: true },
  });

  if(!assignment) return ctx.status = 404;
  return ctx.status = 201;
});

export default router;
