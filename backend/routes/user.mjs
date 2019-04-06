import KoaRouter from '@circuitcoder/koa-router';

import User from '../db/user';
import Conference from '../db/conference';
import Payment from '../db/payment';
import Assignment from '../db/assignment';

import { generateJWT } from '../util';
import Config from '../config';

import { promisify } from 'util';
import crypto from 'crypto';
import mailer from '../mailer';

const randomBytes = promisify(crypto.randomBytes);

const router = new KoaRouter();

// Register
router.post('/', async ctx => {
  const { email, pass, realname } = ctx.request.body;

  const token = (await randomBytes(24)).toString('hex');
  const user = new User({ email, realname, token });
  await user.setPass(pass);

  try {
    await user.save();
  } catch(e) {
    if(e.name === 'MongoError' && e.code === 11000) {
      // Duplicated
      ctx.status = 400;
      ctx.body = { err: 'duplicated' };
      return;
    }

    throw e;
  }

  await mailer.send(email, '请验证您的注册', 'reg', {
    name: realname,
    link: `${Config.base}/user/verify/${token}`,
  });
  const jwt = await generateJWT(user._id.toString());

  ctx.status = 201;
  return ctx.body = { token: jwt };
});

router.post('/pass', async ctx => {
  const { email } = ctx.request.body;

  const token = (await randomBytes(24)).toString('hex');

  const user = await User.findOneAndUpdate({ email }, {
    $set: { passToken: token },
  });

  if(!user) return ctx.status = 201; // Hide error

  await mailer.send(email, '密码重置', 'forgot', {
    name: user.realname,
    link: `${Config.base}/user/pass/${token}`,
  });

  return ctx.status = 201;
});

router.get('/pass/:token', async ctx => {
  const pass = (await randomBytes(8)).toString('hex');
  const user = await User.findOneAndUpdate({ passToken: ctx.params.token }, { $set: { passToken: null }});
  if(!user) return ctx.status = 404;

  await user.setPass(pass);
  await user.save();

  await mailer.send(user.email, '密码重置 - 完成', 'pass', {
    name: user.realname,
    pass,
  });

  return ctx.body = '新密码已发往您的邮箱，您可以关闭此页面了';
});

// Match id and self
const matcher = async (ctx, next) => {
  if(ctx.params.id)
    if(ctx.uid !== ctx.params.id.toString() && !ctx.user.isAdmin)
      return ctx.status = 403;

  await next();
};

router.get('/verify/:token', matcher, async ctx => {
  const result = await User.findOneAndUpdate({
    token: ctx.params.token,
  }, {
    $set: {
      token: null,
      status: 'verified',
    },
  });

  if(!result) return ctx.status = 404;
  return ctx.body = '验证成功，您可以关闭此页面了';
});

router.post('/:id/profile', matcher, async ctx => {
  const { profile } = ctx.request.body;

  const result = await User.findOneAndUpdate({
    _id: ctx.params.id,
  }, {
    $set: {
      profile,
    }
  });

  if(!result) return ctx.status = 404;
  return ctx.status = 204;
});

router.post('/:id/pass', matcher, async ctx => {
  const user = await User.findById(ctx.params.id);
  if(!user) return ctx.status = 404;
  
  if(!ctx.user.isAdmin)
    if(!await user.testPass(ctx.request.body.curpass))
      return ctx.status = 403;

  await user.setPass(ctx.request.body.newpass);
  await user.save();
  return ctx.status = 201;
});

router.post('/:id/idVerify', matcher, async ctx => {
  const { idNumber, realname } = ctx.request.body;

  const user = await User.findById(ctx.params.id);
  if(!user) return ctx.status = 404;
  if(user.idNumber) return ctx.status = 400;

  const resp = await request.post('https://api.yonyoucloud.com/apis/dst/matchIdentity/matchIdentity', {
    json: true,
    headers: {
      authorization: 'apicode',
      apicode: Config.apikeys.idverify,
    },
    body: {
      idNumber,
      userName: realname,
    },
  });

  if(!resp.success) {
    ctx.status = 400;
    return ctx.body = { err: resp.message };
  }

  user.idNumber = idNumber;
  user.realname = realname;
  await user.save(); // Optimistic lock

  return ctx.status = 204;
});

router.get('/:id/conferences', matcher, async ctx => {
  const list = await Conference.find({
    'registrants.user': ctx.params.id,
  }, {
    'registrants.$': 1,
    closed: 1,

    _id: 1,
    abbr: 1,
    title: 1,
    background: 1,
    logo: 1,
  }).lean();

  for(const conf of list) {
    conf.reg = conf.registrants[0];
    conf.registrants = undefined;
  }

  ctx.body = list;
});

router.get('/:id/payment', matcher, async ctx => {
  const status = ctx.query.status;
  ctx.body = await Payment.find({
    payee: ctx.params.id,
    status,
  }).sort({ creation: -1 }).populate('conf', '_id logo abbr').lean();
});

router.get('/:id/assignment', matcher, async ctx => {
  const submitted = ctx.query.submitted === 'true' ? true : { $ne: true };
  ctx.body = await Assignment.find({
    assignee: ctx.params.id,
    submitted,
  }).sort({ creation: -1 }).populate('conf', '_id logo abbr').lean();
});

router.post('/:id/accessKey', matcher, async ctx => {
  const { name } = ctx.request.body;
  // TODO: sanitize

  const bytes = await randomBytes(16);
  const key = bytes.toString('hex');
  const jwt = await generateJWT(key, 'key');

  const found = await User.findOneAndUpdate({
    _id: ctx.params.id,
    'accessKeys.name': { $ne: name },
  }, {
    $push: {
      accessKeys: {
        name,
        lastAccess: null,
        key,
      },
    },
  });

  if(!found) return ctx.status = 400; // No such user or duplicate name
  return ctx.body = { token: jwt };
});

router.delete('/:id/accessKey/:name', matcher, async ctx => {
  const { id, name } = ctx.params;


  const found = await User.findOneAndUpdate({
    _id: id,
    'accessKeys.name': name,
  }, {
    $pull: { accessKeys: { name } },
  }).lean();

  if(!found) return ctx.status = 404;
  return ctx.status = 204;
});

router.get('/:id/accessKey', matcher, async  ctx => {
  const result = await User.findById(ctx.params.id, {
    'accessKeys.name': 1,
    'accessKeys.lastAccess': 1,
  }).lean();

  if(result) return ctx.body = result.accessKeys || [];
});

export default router;
