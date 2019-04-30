import KoaRouter from '@circuitcoder/koa-router';

import Interview from '../db/interview';
import Assignment from '../db/assignment';

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

  const asInterviewer = result.interviewer.toString() === ctx.user._id.toString()
    || ctx.user.isAdmin
    || result.conf.moderators.some(e => e.toString() === ctx.user._id.toString());

  if(result.interviewee.toString() !== ctx.user._id.toString() && !asInterviewer) return ctx.status = 404; // For secrutiy consideration

  result.conf.moderators = undefined;

  if(asInterviewer)
    result.assignments = (await Assignment.find({ assignee: result.interviewee }, {
      _id: 1,
      title: 1,
      submitted: 1,
      deadline: 1,
    }).lean());

  return ctx.body = result;
});

export default router;
