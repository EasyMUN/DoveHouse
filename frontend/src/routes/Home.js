import React, { useState, useCallback, useContext } from 'react';

import { makeStyles } from '@material-ui/styles';

import clsx from 'clsx';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';

import Card from '@material-ui/core/Card';
import CardActions from '../overrides/CardActions';
import CardContent from '../overrides/CardContent';
import Button from '@material-ui/core/Button';

const styles = makeStyles(theme => ({
  wrapper: {
    height: '100vh',
    width: '100vw',
    overflow: 'auto',
    position: 'absolute',
    top: 0,
  },

  inner: {
    marginTop: 80,
    maxWidth: 700,
    margin: '0 auto',
    padding: '0 20px',
  },

  toolbar: {
    height: 60,
    position: 'absolute',
    width: '100%',
    top: 0,

    transition: 'box-shadow .2s ease, background .2s ease',
  },

  toolbarSpacer: {
    height: 60,
  },

  toolbarFloating: {
    boxShadow: 'rgba(0,0,0,.3) 0 4px 12px',
    background: theme.palette.primary.light,
  },

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

  const [onTop, setOnTop] = useState(true);

  const mapS2P = useCallback(({ user }) => ({
    user,
  }));
  const { user } = useMappedState(mapS2P);

  const scrollCB = useCallback(ev => {
    const scrollTop = ev.target.scrollTop;
    setOnTop(scrollTop === 0);
  });

  return <div className={cls.wrapper} onScroll={scrollCB}>
    <div className={clsx(cls.toolbar, { [cls.toolbarFloating]: !onTop })}></div>
    <div className={cls.toolbarSpacer}></div>
    <div className={cls.inner}>
      <Typography variant="h2" className={cls.greet}>晚上好，{user.realname}!</Typography>
      <Typography variant="h4" className={cls.hint}>以下是您收到的通知</Typography>

      <Card className={cls.card}>
        <CardContent>
          <Typography gutterBottom variant="body2" className={cls.type}>指南</Typography>
          <Typography gutterBottom variant="h5" component="h2" className={cls.title}>完善个人信息</Typography>

          <Typography gutterBottom variant="body1" className={cls.desc}>请先前往设置页面完善您的个人信息。在此之前，您只能查看会议的介绍，无法报名会议。我们不会把您的个人信息分享给除您报名会议主办人员以外的任何人。</Typography>
        </CardContent>
        <CardActions>
          <Button color="secondary">现在就去</Button>
        </CardActions>
      </Card>

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
    </div>
  </div>;
});
