import React, { useCallback } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import { useMappedState } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';

import Card from '@material-ui/core/Card';
import CardActions from '../overrides/CardActions';
import CardContent from '../overrides/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Icon from '@material-ui/core/Icon';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import { NavLink } from 'react-router-dom';

import BasicLayout from '../layout/Basic';

import { calcTotal } from './Payment';

const styles = makeStyles(theme => ({
  greet: {
    color: 'rgba(0,0,0,.87)',
  },

  hint: {
    color: 'rgba(0,0,0,.38)',
    marginTop: theme.spacing.unit,
  },

  card: {
    marginTop: 40,
  },

  divider: {
    marginTop: 40,
  },

  logo: {
    height: 18,
    width: 18,
    marginRight: theme.spacing.unit,
  },

  type: {
    marginBottom: 0,
    color: 'rgba(0,0,0,.38)',
  },

  title: {
    marginBottom: 20,
  },

  abbrLine: {
    display: 'flex',
    alignItems: 'center',
  },

  empty: {
  },

  emptyContent: {
    textAlign: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },

  emptyIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    height: 160,
    width: 160,
    background: 'rgba(0,0,0,.12)',
    borderRadius: '50%',
    fontSize: 80,
    color: 'rgba(0,0,0,.54)',
    marginBottom: 20,
  },

  paymentContent: {
    paddingBottom: 20,
  },

  paymentDesc: {
    color: 'rgba(0,0,0,.54)',
    fontSize: 20,
    lineHeight: '24px',
  },

  paymentTotal: {
    color: 'rgba(0,0,0,.87)',
    fontSize: 32,
    lineHeight: '36px',

    '& small': {
      color: 'rgba(0,0,0,.38)',
    },
  },
}));

export default React.memo(() => {
  const cls = styles();

  const mapS2P = useCallback(({ user, confs, payments }) => ({
    user, confs, payments
  }));
  const { user, confs, payments } = useMappedState(mapS2P);

  const hour = new Date().getHours();
  let greeting = '早上';
  if(hour <= 4 || hour >= 16) greeting = '晚上'
  else if(hour >= 10) greeting = '中午';

  const paymentsRegion = payments ? payments.map(payment => <Card className={cls.card} key={payment._id}>
    <NavLink to={`/payment/${payment._id}`}>
      <CardActionArea>
        <CardContent className={cls.paymentContent}>
          <div className={cls.abbrLine}>
            <Avatar src={payment.conf.logo} className={cls.logo}/>
            <Typography variant="body2" className={cls.type}>{ payment.conf.abbr }</Typography>
          </div>
          <Typography gutterBottom variant="h5" className={cls.title}>待付 / 未确认订单</Typography>

          <Typography variant="body1" className={cls.paymentDesc}>{payment.desc}</Typography>
          <Typography variant="body1" className={cls.paymentTotal}>{calcTotal(payment)} <small>CNY</small></Typography>
        </CardContent>
      </CardActionArea>
    </NavLink>
  </Card>) : null;

  const confsRegion = confs ? confs.map(conf => <Card className={cls.card} key={conf._id}>
    <CardContent>
      <NavLink to={`/conference/${conf._id}`}>
        <div className={cls.abbrLine}>
          <Avatar src={conf.logo} className={cls.logo}/>
          <Typography gutterBottom variant="body2" className={cls.type}>{ conf.abbr }</Typography>
        </div>
      </NavLink>
      <Typography variant="h5" className={cls.title}>报名进度</Typography>

      <Stepper>
        <Step><StepLabel>报名</StepLabel></Step>
        <Step><StepLabel>学测</StepLabel></Step>
        <Step><StepLabel>面试</StepLabel></Step>
        <Step><StepLabel>席位分配</StepLabel></Step>
      </Stepper>
    </CardContent>
  </Card>) : [];

  const clear =
    user.profile && user.idNumber && paymentsRegion.length === 0;

  return <BasicLayout>
    <Typography variant="h2" className={cls.greet}>{ greeting }好，{user.realname}!</Typography>
    { clear ?
        <Typography variant="h4" className={cls.hint}>你目前没有待办的通知!</Typography>
        :
        <Typography variant="h4" className={cls.hint}>以下是您收到的通知</Typography>
    }

    { user.profile ? null :
        <Card className={cls.card}>
          <CardContent>
            <Typography gutterBottom variant="body2" className={cls.type}>指南</Typography>
            <Typography gutterBottom variant="h5" className={cls.title}>完善个人信息</Typography>

            <Typography gutterBottom variant="body1" className={cls.desc}>请先前往设置页面完善您的个人信息。在此之前，您只能查看会议的介绍，无法报名会议。我们不会把您的个人信息分享给除您报名会议主办人员以外的任何人。</Typography>
          </CardContent>
          <CardActions>
            <NavLink to="/profile">
              <Button color="secondary">现在就去</Button>
            </NavLink>
          </CardActions>
        </Card>
    }

    { user.status === 'waiting' ?
        <Card className={cls.card}>
          <CardContent>
            <Typography gutterBottom variant="body2" className={cls.type}>指南</Typography>
            <Typography gutterBottom variant="h5" component="h2" className={cls.title}>验证账号</Typography>

            <Typography gutterBottom variant="body1" className={cls.desc}>请前往您的邮箱验证账号。在此之前，您只能查看会议的介绍，无法报名会议，并且不会收到任何邮件通知。</Typography>
          </CardContent>
          <CardActions>
            <Button>重发邮件</Button>
          </CardActions>
        </Card>
        : null }

    { paymentsRegion }
    <Divider className={cls.divider}/>
    { confsRegion.length > 0 ? confsRegion :
        <Card className={clsx(cls.empty, cls.card)}>
          <NavLink to="/conference">
            <CardActionArea>
              <CardContent className={cls.emptyContent}>
                <Icon className={cls.emptyIcon}>assignment_turned_in</Icon>
                <Typography variant="body1">报名中的会议什么的一个都没有，从侧边栏前往 <strong>全部会议</strong> 选个会议报名吧</Typography>
              </CardContent>
            </CardActionArea>
          </NavLink>
        </Card>
    }
  </BasicLayout>
});
