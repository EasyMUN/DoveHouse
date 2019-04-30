import React, { useCallback, useState, useEffect } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '../overrides/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LinearProgress from '@material-ui/core/LinearProgress';

import SwipeableViews from 'react-swipeable-views';

import { useRouter } from '../Router';

import { NavLink } from 'react-router-dom';

import { get } from '../store/actions';

import BasicLayout from '../layout/Basic';

import UserAvatar from '../comps/UserAvatar';

import {
  generateAssignmentDesc,
  generateAssignmentIcon,
} from './Conference';

const styles = makeStyles(theme => ({
  logo: {
    height: 18,
    width: 18,
    marginRight: theme.spacing.unit,
  },

  abbr: {
    marginBottom: 0,
    color: 'rgba(0,0,0,.38)',
  },

  abbrLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    marginTop: 40,
  },

  infoCard: {
    '&$card': {
      marginTop: 20,
    },
  },

  paymentDesc: {
    textAlign: 'center',
    '$done &': {
      textDecoration: 'line-through',
    },
  },

  paymentTotal: {
    '& small': {
      color: 'rgba(0,0,0,.38)',
      textDecoration: 'none',
    },

    margin: '40px 0',
    textAlign: 'center',
  },

  paidHint: {
    display: 'none',
    textAlign: 'center',
    color: 'rgba(0,0,0,.38)',
    marginBottom: 40,
    marginTop: -35,
  },

  ddlHint: {
    display: 'block',
    textAlign: 'center',
    color: 'rgba(0,0,0,.38)',
    marginBottom: 40,
    marginTop: -35,
  },

  ident: {
    textAlign: 'center',
    color: 'rgba(0,0,0,.38)',
    marginBottom: 40,

    '& strong': {
      color: 'rgba(0,0,0,.87)',
    },
  },

  done: {
    '& $paidHint': {
      display: 'block',
    },

    '& $ddlHint': {
      display: 'none',
    },

    '& $ident': {
      display: 'none',
    },

    '& $qrcodes': {
      display: 'none',
    },
  },

  qrcodes: {},

  qrContainer: {
    padding: 20,
    textAlign: 'center',
  },

  pageTitle: {
    color: 'rgba(0,0,0,.54)',
  },

  userGroup: {
    marginTop: 20,
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
  },

  userAvatar: {
    boxShadow: 'rgba(0,0,0,.3) 0 4px 12px',
  },

  userInfo: {
    marginLeft: 20,
    flex: 1,
  },

  role: {
    marginBottom: 0,
    fontSize: 18,
    lineHeight: '24px',

    color: 'rgba(0,0,0,.54)',
  },

  info: {
    fontWeight: 'bold',
  },

  desc: {
    fontWeight: 'normal',
    width: 40,
    display: 'inline-block',
    color: 'rgba(0,0,0,.54)',
  },

  centerIconWrapper: {
    margin: '20px 0',
    textAlign: 'center',
  },

  centerIcon: {
    fontSize: 60,
    transform: 'rotate(90deg)',
    color: 'rgba(0,0,0,.38)',
  },

  waiting: {
    textAlign: 'center',
    color: 'rgba(0,0,0,.38)',
  },

  listTitle: {
    margin: 16,
    marginBottom: 10,
  },

}));

export default React.memo(() => {
  const cls = styles();

  const [interview, setInterview] = useState(null);

  const { match } = useRouter();
  const dispatch = useDispatch();
  const { user } = useMappedState(({ user }) => ({ user }));

  async function fetchInterview() {
    const i = await dispatch(get(`/interview/${match.params.id}`));
    setInterview(i);
  }

  useEffect(() => {
    fetchInterview();
  }, [match]);

  const inner = interview ? <>
    <Typography variant="h3" className={cls.pageTitle}>面试详情</Typography>

    <Card className={cls.card}>
      <CardContent className={cls.content}>
        <NavLink className={cls.abbrLine} to={`/conference/${interview.conf._id}`}>
          <Avatar src={interview.conf.logo} className={cls.logo}/>
          <Typography variant="body2" className={cls.abbr}>{ interview.conf.abbr }</Typography>
        </NavLink>

        <div className={cls.userGroup}>
          <UserAvatar className={cls.userAvatar} email={interview.interviewee.email} name={interview.interviewee.realname} size={160} />
          <div className={cls.userInfo}>
            <Typography variant="h6" className={cls.role}>代表</Typography>
            <Typography variant="h4" className={cls.name}>{ interview.interviewee.realname }</Typography>
            <Typography variant="body1" className={cls.info}><span className={cls.desc}>邮箱</span>{ interview.interviewee.email }</Typography>
            <Typography variant="body1" className={cls.info}><span className={cls.desc}>电话</span>{ interview.interviewee.profile.phone }</Typography>
            <Typography variant="body1" className={cls.info}><span className={cls.desc}>QQ</span>{ interview.interviewee.profile.qq }</Typography>
            { interview.interviewee.profile.wechat ?
                <Typography variant="body1" className={cls.info}><span className={cls.desc}>微信</span>{ interview.interviewee.profile.wechat }</Typography>
                : null }
          </div>
          { /*
          { user._id === interview.interviewer._id ?
              <IconButton component={NavLink} to={`/conference/${interview.conf._id}/admin/reg/${interview.interviewee._id}`}>
                <Icon>arrow_forward</Icon>
              </IconButton> : null }
              */ }
        </div>

        <div className={cls.centerIconWrapper}>
          <Icon className={cls.centerIcon}>compare_arrows</Icon>
        </div>

        <div className={cls.userGroup}>
          <UserAvatar className={cls.userAvatar} email={interview.interviewer.email} name={interview.interviewer.realname} size={160} />
          <div className={cls.userInfo}>
            <Typography variant="h6" className={cls.role}>面试官</Typography>
            <Typography variant="h4" className={cls.name}>{ interview.interviewer.realname }</Typography>
            <Typography variant="body1" className={cls.info}><span className={cls.desc}>邮箱</span>{ interview.interviewer.email }</Typography>
            <Typography variant="body1" className={cls.info}><span className={cls.desc}>电话</span>{ interview.interviewer.profile.phone }</Typography>
            <Typography variant="body1" className={cls.info}><span className={cls.desc}>QQ</span>{ interview.interviewer.profile.qq }</Typography>
            { interview.interviewer.profile.wechat ?
                <Typography variant="body1" className={cls.info}><span className={cls.desc}>微信</span>{ interview.interviewer.profile.wechat }</Typography>
                : null }
          </div>
        </div>
      </CardContent>
      <CardContent>
        <Typography variant="body1" className={cls.waiting}>进行中...</Typography>
      </CardContent>
      <LinearProgress color="secondary" />
    </Card>
    { interview.assignments && interview.assignments.length > 0 ?
        <Card className={clsx(cls.card, cls.infoCard)}>
        <Typography variant="h5" className={cls.listTitle}>学测</Typography>
          <List>
            { interview.assignments.map(assignment => <ListItem button component={NavLink} to={`/assignment/${assignment._id}`} key={assignment._id}>
              <ListItemIcon>
                { generateAssignmentIcon(assignment) }
              </ListItemIcon>
              <ListItemText primary={assignment.title} secondary={generateAssignmentDesc(assignment)} />
            </ListItem>) }
          </List>
        </Card> : null }
  </> : null;

  return <BasicLayout>
    { inner }
  </BasicLayout>;
});
