import KoaRouter from '@circuitcoder/koa-router';

import Conference from '../db/conference';
import User from '../db/user';
import Committee from '../db/committee';
import Payment from '../db/payment';
import Assignment from '../db/assignment';
import Interview from '../db/interview';

import Config from '../config';

import { promisify } from 'util';
import crypto from 'crypto';
import fetch from 'node-fetch';
import mailer from '../mailer';

import MarkdownIt from 'markdown-it';

const md = MarkdownIt();

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
  if(user.status !== 'verified') flag = false;
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
      tags: [],
    }},
  }, { fields: {
    webhooks: 1,
  }});

  if(!result) return ctx.status = 404;

  for(const wh of result.webhooks)
    try {
      await fetch(wh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new-reg',
          payload: {
            user: ctx.params.user,
            reg: ctx.request.body.reg,
            extra: ctx.request.body.extra,
            tags: [],
            stage: 'reg',
          },
        }),
      });
    } catch(e) {
      console.error(e);
    }

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
  }).sort({ creation: 1 }).lean();
});

router.get('/:id/assignment/:user', async ctx => {
  const allowed = ctx.user.isAdmin || ctx.params.user === ctx.user._id.toString();
  if(!allowed) return ctx.status = 403;

  return ctx.body = await Assignment.find({
    conf: ctx.params.id,
    assignee: ctx.params.user,
  }).sort({ creation: 1 }).lean();
});

router.get('/:id/interview/:user', async ctx => {
  const allowed = ctx.user.isAdmin || ctx.params.user === ctx.user._id.toString();
  if(!allowed) return ctx.status = 403;

  return ctx.body = await Interview.find({
    conf: ctx.params.id,
    interviewee: ctx.params.user,
  }).sort({ creation: 1 }).populate('interviewer', 'realname email').lean();
});

router.get('/:id/interviewee/:user', async ctx => {
  const allowed = ctx.user.isAdmin || ctx.params.user === ctx.user._id.toString();
  if(!allowed) return ctx.status = 403;

  return ctx.body = await Interview.find({
    conf: ctx.params.id,
    interviewer: ctx.params.user,
  }).sort({ creation: 1 }).populate('interviewee', 'realname email').lean();
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

  const { title, main } = ctx.request.body;
  const conf = await Conference.findOneAndUpdate(criteria, { $push: {
    publishes: {
      title, main,

      date: new Date().toISOString(),
    },
  }}, {
    fields: {
      registrants: 1,
      abbr: 1,
    },
  }).populate('registrants.user', 'realname email');

  if(!conf) return ctx.status = 404;
  const compiled = md.render(main);

  const users = conf.registrants.map(({ user }) => user);

  async function sendAll() {
    for(const user of users) {
      try {
        await mailer.send(user.email, `${conf.abbr} 会议公告: ${title}`, 'publish', {
          name: user.realname,
          conf: conf.abbr,

          title, compiled
        });
      } catch(e) {
        console.error(e);
        // Ignores for now
      }
    }
  }

  sendAll();

  return ctx.status = 201;
});

router.get('/:id/stat', async ctx => {
  const criteria = {
    _id: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference.findOne(criteria, { webhooks: 1, 'registrants._id': 1 });

  if(!conf) return ctx.status = 404;

  const pcp = Payment.count({
    conf: ctx.params.id,
  });

  const acp = Assignment.count({
    conf: ctx.params.id,
  });

  const icp = Interview.count({
    conf: ctx.params.id,
  });

  const [paymentCount, assignmentCount, interviewCount] = await Promise.all([pcp, acp, icp]);

  return ctx.body = {
    regCount: conf.registrants.length,
    paymentCount,
    assignmentCount,
    interviewCount,
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
    .findOne(criteria, {
      'registrants.user': 1,
      'registrants.stage': 1,
      'registrants.tags': 1,
    })
    .populate('registrants.user', 'email realname profile.school')
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

router.put('/:id/list/:uid/stage', async ctx => {
  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const { stage } = ctx.request.body;

  if(![
    'reg',
    'exam',
    'interview',
    'seating',
  ].includes(stage)) return ctx.status = 400;

  const conf = await Conference
    .findOneAndUpdate(criteria, { $set: { 'registrants.$.stage': stage }})
    .lean();

  if(!conf) return ctx.status = 404;
  return ctx.status = 201;
});

router.put('/:id/list/:uid/extra', async ctx => {
  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const { extra } = ctx.request.body;

  const conf = await Conference
    .findOneAndUpdate(criteria, { $set: { 'registrants.$.extra': extra }})
    .lean();

  if(!conf) return ctx.status = 404;
  return ctx.status = 201;
});

router.get('/:id/payment', async ctx => {
  if(!ctx.user.isAdmin) return ctx.status = 403;

  ctx.body = await Payment.find({
    conf: ctx.params.id,
  }).populate('payee', 'realname email').lean();
});

router.post('/:id/payment/:uid', async ctx => {
  if(!ctx.user.isAdmin) return ctx.status = 403;

  const { total, desc, detail, discounts: _dis } = ctx.request.body;
  const discounts = _dis || [];

  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

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

  try {
    await mailer.send(user.email, `新订单: ${desc}`, 'payment', {
      name: user.realname,
      conf: conf.abbr,

      desc, pricing, detail,
      link: `${Config.frontend}/payment/${_id}`,
    });
  } catch(e) {
    console.error(e);
    // Ignores for now
  }

  return ctx.body = { _id };
});

router.get('/:id/assignment', async ctx => {
  const criteria = {
    conf: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  ctx.body = await Assignment.find(criteria)
    .populate('assignee', 'realname email').lean();
});

router.post('/:id/assignment/:uid', async ctx => {
  const { title, probs, deadline } = ctx.request.body;

  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference.findOne(criteria, { abbr: 1 });
  if(!conf) return ctx.status = 403;

  const user = await User.findById(ctx.params.uid, { email: 1, realname: 1 });

  const { _id } = await Assignment.create({
    conf: ctx.params.id,
    assignee: ctx.params.uid,

    title, probs, deadline,

    ans: null,

    submitted: false,
    creation: new Date(),
  });

  try {
    await mailer.send(user.email, `新学测: ${title}`, 'assignment', {
      name: user.realname,
      conf: conf.abbr,

      title, deadline: new Date(deadline).toLocaleString('zh-Hans'),
      link: `${Config.frontend}/assignment/${_id}`,
    });
  } catch(e) {
    console.error(e);
    // Ignores for now
  }

  return ctx.body = { _id };
});

router.get('/:id/interview', async ctx => {
  const criteria = {
    conf: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  ctx.body = await Interview.find(criteria)
    .populate('interviewee', 'realname email')
    .populate('interviewer', 'realname email')
    .lean();
});

router.post('/:id/interview/:uid', async ctx => {
  const { interviewer } = ctx.request.body;

  const criteria = {
    _id: ctx.params.id,
    'registrants.user': ctx.params.uid,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const conf = await Conference.findOne(criteria, { abbr: 1 });
  if(!conf) return ctx.status = 403;

  const user = await User.findById(ctx.params.uid, { email: 1, realname: 1 });
  const intUser = await User.findById(interviewer, { email: 1, realname: 1 });

  const { _id } = await Interview.create({
    conf: ctx.params.id,
    interviewee: ctx.params.uid,
    interviewer,
    creation: new Date(),
  });

  try {
    await mailer.send(user.email, `新面试`, 'interview', {
      name: user.realname,
      conf: conf.abbr,

      interviewer: intUser.realname,

      link: `${Config.frontend}/interview/${_id}`,
    });
  } catch(e) {
    console.error(e);
    // Ignores for now
  }

  try {
    await mailer.send(intUser.email, `新面试分配`, 'interviewee', {
      name: intUser.realname,
      conf: conf.abbr,

      interviewee: user.realname,

      link: `${Config.frontend}/interview/${_id}`,
    });
  } catch(e) {
    console.error(e);
    // Ignores for now
  }

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

router.get('/:id/interview', async ctx => {
  ctx.body = await Interview.find({ conf: ctx.params.id }).populate('interviewer', 'name email').populate('interviewee', 'name email');
});

router.get('/:id/interviewer', async ctx => {
  const criteria = {
    _id: ctx.params.id,
  };

  if(!ctx.user.isAdmin)
    criteria.moderators = ctx.user._id;

  const interviewers = await Conference.aggregate([
    { $match: criteria },
    { $project: { interviewers: 1, cid: '$_id' }},
    { $unwind: '$interviewers' },
    { $lookup: {
      from: 'interviews',
      localField: 'interviewers',
      foreignField: 'interviewer',
      as: 'interviews',
    } },
    { $project: {
      user: '$interviewers',
      interviews: { $filter: {
        input: '$interviews',
        as: 'interview',
        cond: { $and: [
          { $eq: ['$$interview.close', null] },
          { $eq: ['$$interview.conf', '$cid'] },
        ] },
      }, },
    } },
    { $project: {
      _d: 1,
      user: '$user',
      assigned: { $size: '$interviews' },
    } },
    { $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
    } },
    { $unwind: '$user' },
    { $project: {
      _id: '$user._id',
      realname: '$user.realname',
      email: '$user.email',
      assigned: '$assigned',
    } },
  ]);

  ctx.body = interviewers;
});

export default router;
