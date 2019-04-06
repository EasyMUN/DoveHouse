import React, { useMemo, useCallback, useState, useEffect } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import { useDispatch } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '../overrides/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';

import SwipeableViews from 'react-swipeable-views';

import { useRouter } from '../Router';

import { NavLink } from 'react-router-dom';

import { get, post } from '../store/actions';
import { debounce } from '../util';

import BasicLayout from '../layout/Basic';

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
    marginTop: 20,
  },

  pageHint: {
    color: 'rgba(0,0,0,.38)',
  },

  pageTitle: {
    color: 'rgba(0,0,0,.54)',
    marginBottom: 40,
  },

  submissionBarSpacer: {
    height: 70,
  },

  submissionBarPositioner: {
    position: 'fixed',
    bottom: 0,
    height: 70,
    left: 0,
    right: 0,
  },

  submissionBarContainer: {
    margin: '0 auto',
    maxWidth: 700,
    boxSizing: 'border-box',
    padding: '0 20px',
    height: '100%',
  },

  submissionBar: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    display: 'flex',
    alignItems: 'center',

    padding: '0 20px',
  },

  deadline: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  deadlineHint: {
    fontSize: 12,
    lineHeight: '12px',
    color: 'rgba(0,0,0,.38)',
  },

  deadlineContent: {
    fontSize: 20,
    lineHeight: '24px',
  },

  helpBtn: {
    padding: 8,
    margin: 4,
  },

  '@keyframes syncRotating': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(-180deg)' },
  },

  syncIndicator: {
    color: 'rgba(0,0,0, .54)',
    animation: '$syncRotating .5s linear infinite',

    opacity: 0,
    transition: 'opacity .2s ease-in',
  },

  syncIndicatorShown: {
    opacity: 1,
    transition: 'opacity .2s ease-out',
  },
}));

export default React.memo(() => {
  const cls = styles();

  const [assignment, setAssignment] = useState(null);
  const [ans, setAns] = useState(null);
  const [syncing, setSyncing] = useState(null);

  const { match } = useRouter();
  const dispatch = useDispatch();

  async function fetchAssignment() {
    const a = await dispatch(get(`/assignment/${match.params.id}`));
    setAssignment(a);
    setAns(a.ans || a.probs.map(() => ''));
  }

  const syncUp = useMemo(() => debounce(async ans => {
    // TODO: cancel ongoing syncs
    setSyncing(true);
    await dispatch(post(`/assignment/${match.params.id}/ans`, { ans }, 'PUT'));
    setSyncing(false);
  }, 1000), [match, setSyncing]);

  useEffect(() => {
    fetchAssignment();
  }, [match]);

  const outdated = assignment && new Date(assignment.deadline) < new Date();
  let btnText = '标记为完成';
  if(assignment && assignment.submitted) btnText = '已标记为完成';
  else if(outdated) btnText = '已超时';

  const inner = assignment ? <>
    <Typography variant="h6" className={cls.pageHint}>学测</Typography>
    <Typography variant="h3" className={cls.pageTitle}>{ assignment.title }</Typography>

    { assignment.probs.map((prob, index) => <Card key={index} className={cls.card}>
      <CardContent>
        <Typography variant="h5" className={cls.prob} gutterBottom>{ prob }</Typography>
        <TextField
          multiline
          fullWidth
          value={ans ? ans[index] : ''}
          onChange={ev => {
            const updated = [...ans];
            updated[index] = ev.target.value;
            setAns(updated);
            syncUp(updated);
          }}
        />
      </CardContent>
    </Card>) }

    <div className={cls.submissionBarSpacer} />

    <div className={cls.submissionBarPositioner}>
      <div className={cls.submissionBarContainer}>
        <Card className={cls.submissionBar}>
          <div className={cls.deadline}>
            <div className={cls.deadlineHint}>DDL</div>
            <div className={cls.deadlineContent}>{new Date(assignment.deadline).toLocaleString()}</div>
          </div>

          <Icon className={clsx(cls.syncIndicator, syncing ? cls.syncIndicatorShown : null)}>sync</Icon>
          <IconButton className={cls.helpBtn}><Icon>help</Icon></IconButton>
          <Button variant="contained" color="secondary" disabled={outdated || assignment.submitted}>{ btnText }</Button>
        </Card>
      </div>
    </div>
  </> : null;

  return <BasicLayout>
    { inner }
  </BasicLayout>;
});
