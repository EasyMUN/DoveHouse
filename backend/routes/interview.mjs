import KoaRouter from '@circuitcoder/koa-router';

import Interview from '../db/interview';

import Config from '../config';

import mailer from '../mailer';

const router = new KoaRouter();

router.get('/:id', async ctx => {
  const result = await Interview.findById(ctx.params.id)
    .populate('conf', 'logo abbr _id title payments moderators')
    .populate('interviewer', 'email realname profile.wechat profile.qq profile.phone')
    .populate('interviewee', 'email realname profile.wechat profile.qq profile.phone')
    .lean();
  if(!result) return ctx.status = 404;
  if(result.interviewee.toString() !== ctx.user._id.toString()
    && result.interviewer.toString() !== ctx.user._id.toString()
    && !ctx.user.isAdmin
    && result.conf.moderators.every(e => e.toString() !== ctx.user._id.toString())) return ctx.status = 404; // For secrutiy consideration

  result.conf.moderators = undefined;
  return ctx.body = result;
});

export default router;
