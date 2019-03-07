import React, { useCallback } from 'react';

import { makeStyles } from '@material-ui/styles';

import { useMappedState } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';

import Card from '@material-ui/core/Card';
import CardActions from '../overrides/CardActions';
import CardContent from '../overrides/CardContent';
import Button from '@material-ui/core/Button';

import { NavLink } from 'react-router-dom';

import BasicLayout from '../layout/Basic';

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

  type: {
    marginBottom: 0,
    color: 'rgba(0,0,0,.38)',
  },

  title: {
    marginBottom: 20,
  },
}));

export default React.memo(() => {
  const cls = styles();

  const mapS2P = useCallback(({ user }) => ({
    user,
  }));
  const { user } = useMappedState(mapS2P);

  const hour = new Date().getHours();
  let greeting = '早上';
  if(hour <= 4 || hour >= 16) greeting = '晚上'
  else if(hour >= 10) greeting = '中午';

  return <BasicLayout>
    <Typography variant="h2" className={cls.greet}>{ greeting }好，{user.realname}!</Typography>
    { user.profile && user.idNumber ?
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
  </BasicLayout>
});
