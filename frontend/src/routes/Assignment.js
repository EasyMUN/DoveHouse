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
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import SwipeableViews from 'react-swipeable-views';

import { useRouter } from '../Router';

import { NavLink } from 'react-router-dom';

import { get, post, refresh } from '../store/actions';
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
  },

  card: {
    marginTop: 20,
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

  helpText: {
    marginBottom: theme.spacing.unit,

    '&:last-child': {
      marginBottom: 0,
    },
  },
}));

export default React.memo(() => {
  const cls = styles();

  const [assignment, setAssignment] = useState(null);
  const [ans, setAns] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { match } = useRouter();
  const dispatch = useDispatch();

  async function fetchAssignment() {
    const a = await dispatch(get(`/assignment/${match.params.id}`));
    setAssignment(a);
    if(!ans) setAns(a.ans || a.probs.map(() => ''));
  }

  const syncUp = useMemo(() => debounce(async ans => {
    // TODO: cancel ongoing syncs
    setSyncing(true);
    await dispatch(post(`/assignment/${match.params.id}/ans`, { ans }, 'PUT'));
    setSyncing(false);
  }, 1000), [match, setSyncing]);

  const submit = useCallback(async () => {
    await dispatch(post(`/assignment/${match.params.id}/submitted`, { submitted: true }, 'PUT'));
    const rp = refresh();
    const a = await dispatch(get(`/assignment/${match.params.id}`));
    setAssignment(a);

    // Parallel request and join on rp
    await rp;
  });

  const openHelp = useCallback(() => {
    setHelpOpen(true);
  });

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
  });

  useEffect(() => {
    fetchAssignment();
  }, [match]);

  const outdated = assignment && new Date(assignment.deadline) < new Date();
  let btnText = '标记为完成';
  if(assignment && assignment.submitted) btnText = '已标记为完成';
  else if(outdated) btnText = '已超时';

  const inner = assignment ? <>
    <NavLink to={`/conference/${assignment.conf._id}`}>
      <div className={cls.abbrLine}>
        <Avatar src={assignment.conf.logo} className={cls.logo}/>
        <Typography variant="body2" className={cls.abbr}>{ assignment.conf.abbr }</Typography>
      </div>
    </NavLink>
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
          <IconButton className={cls.helpBtn} onClick={openHelp}><Icon>help</Icon></IconButton>
          <Button
            variant="contained"
            color="secondary"
            disabled={outdated || assignment.submitted}
            onClick={submit}
          >
            { btnText }
          </Button>
        </Card>

        <Dialog
          open={helpOpen}
          onClose={closeHelp}
          scroll="paper"
        >
          <DialogTitle>关于提交的说明</DialogTitle>
          <DialogContent>
            <DialogContentText className={cls.helpText}>所有的更改都是自动保存的，并且无论是否标记为完成或超时，您都可以进行修改。自动保存时，底栏上会闪烁同步标志。</DialogContentText>
            <DialogContentText className={cls.helpText}>但是默认情况下主办方不会在已完成的学测中看到您的提交，除非您将其标记为已提交，或者超时。</DialogContentText>
            <DialogContentText className={cls.helpText}>所以虽然您再标记完成后仍能够进行修改，但是我们推荐只有当您确信您的提交无误后，再标记成完成。</DialogContentText>
            <DialogContentText className={cls.helpText}>此外，如果此学测已经超时，但是您还没有标记为完成，那么此学测将会仍然显示在您的主页上，并且在面试官视角将会显示为 "超时"。因此即使超时，我们推荐您尽快将其完成并标记。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={closeHelp}>懂了</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  </> : null;

  return <BasicLayout>
    { inner }
  </BasicLayout>;
});
