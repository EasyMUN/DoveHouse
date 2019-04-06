import React, { useMemo, useEffect, useState, useCallback } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import { Map } from 'immutable';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Badge from '@material-ui/core/Badge';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import InputBase from '@material-ui/core/InputBase';

import PostEdit from '../comps/PostEdit';
import Loading from '../comps/Loading';

import { get, post, refresh, fetchConf, fetchComms } from '../store/actions';

import { useRouter } from '../Router';
import { NavLink } from 'react-router-dom';

import { useSnackbar } from '../Snackbar';

import HeaderLayout from '../layout/Header';

import ColorThief from 'color-thief';
import Chroma from 'chroma-js';

import { calcTotal } from './Payment';

const styles = makeStyles(theme => ({
  header: {
    paddingBottom: theme.spacing.unit * 4,
    display: 'flex',
    alignItems: 'center',

    maxWidth: 700,
    margin: '0 auto',
    padding: '0 20px',

    transition: 'padding-bottom .2s ease, max-width .1s ease .1s'
  },

  headerExt: {
    paddingBottom: theme.spacing.unit * 2,
    maxWidth: 'calc(100vw)',

    height: 60,

    '& $title': {
      color: 'black',
      fontWeight: 300,
    },

    '& $abbr': {
      display: 'none',
    },

    '& $logo': {
      height: 50,
      width: 50,

      '& img': {
        width: 40,
        height: 40,
      },
    },
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
  },

  logo: {
    padding: 5,
    background: 'rgba(255,255,255,.8)',
    height: 70,
    width: 70,
    borderRadius: 35,
    boxShadow: 'rgba(0,0,0,.3) 0 2px 6px',

    marginRight: theme.spacing.unit * 2,

    '& img': {
      width: 60,
      height: 60,
    },
  },

  names: {
    flex: 1,
    overflow: 'hidden',
  },

  title: {
    fontSize: 32,
    fontWeight: 600,
    lineHeight: '40px',
    color: 'rgba(255,255,255,.87)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  abbr: {
    fontSize: 24,
    lineHeight: '28px',
    color: 'rgba(255,255,255,.54)',
  },

  subtitle: {
    marginTop: 4*theme.spacing.unit,
    display: 'flex',
    alignItems: 'center',
  },

  subtitleBtn: {
    padding: 8,
    marginLeft: theme.spacing.unit,
  },

  join: {
    marginLeft: theme.spacing.unit * 2,
  },

  imageStub: {
    opacity: 0,
    position: 'absolute',
    top: '-100%',
  },
  
  card: {
    marginTop: theme.spacing.unit,
  },

  postMain: {
    marginTop: theme.spacing.unit,
    whiteSpace: 'pre-wrap',
  },

  commBG: {
    paddingBottom: '20%',
    position: 'relative',
    minHeight: 120,
  },

  commInfo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    padding: '10px 16px',

    '&:last-child': {
      paddingBottom: 10,
    },

    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },

  commTitle: {
    color: 'rgba(255,255,255,.87)',
    fontWeight: 600,
  },

  commAbbr: {
    color: 'rgba(255,255,255,.54)',
    lineHeight: '20px',
    fontSize: 18,
    fontWeight: 300,
  },

  backdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    background: 'linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 70%)',
  },

  empty: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    textAlign: 'center',
    color: 'rgba(0,0,0,.38)',
  },

  progressContent: {
    paddingBottom: 0,
  },

  listTitle: {
    margin: 16,
    marginBottom: 10,
  },

  statList: {
    marginBottom: 16,
  },

  expand: {
    transition: 'transform .2s ease',
  },

  expandInverted: {
    transform: 'rotate(180deg)',
  },

  listNew: {
    marginLeft: 16,
    flex: 1,
  },

  nestedList: {
    paddingLeft: theme.spacing.unit * 4,
  },
}));

export default React.memo(() => {
  const cls = styles();

  const { match } = useRouter();

  const [conf, setConf] = useState(null);
  const [comms, setComms] = useState(null);
  const [reg, setReg] = useState(null);
  const [payments, setPayments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [role, setRole] = useState(null);
  const [stat, setStat] = useState(null);
  const [color, setColor] = useState(null);

  const [regOpen, setRegOpen] = useState(false);
  const [regDetailOpen, setRegDetailOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const closeReg = useCallback(() => setRegOpen(false), [setRegOpen]);
  const closeRegDetail = useCallback(() => setRegDetailOpen(false), [setRegDetailOpen]);
  const closePost = useCallback(() => setPostOpen(false), [setPostOpen]);

  const openReg = useCallback(() => {
    if(!user || !user.profile) {
      enqueueSnackbar('您还没有填写个人信息，不能报名！', {
        variant: 'warning',
        action: <NavLink to="/profile"><Button size="small">立即填写</Button></NavLink>,
      });
      return;
    } else if(conf && conf.requiresRealname && !user.idNumber) {
      enqueueSnackbar('此会议需要您进行实名认证', {
        variant: 'warning',
        action: <NavLink to="/profile"><Button size="small">前往认证</Button></NavLink>,
      });
      return;
    }

    setRegOpen(true);
  }, [setRegOpen, conf]);
  const openRegDetail = useCallback(() => {
    setRegDetailOpen(true);
  }, [setRegDetailOpen]);
  const openPost = useCallback(() => {
    setPostOpen(true);
  }, [setRegDetailOpen]);

  const dispatch = useDispatch();
  const { user } = useMappedState(({ user }) => ({ user }));

  async function updateConf() {
    const conf = await dispatch(fetchConf(match.params.id));
    setConf(conf);
  };

  async function updateComms() {
    const comms = await dispatch(fetchComms(match.params.id));
    setComms(comms);
  };

  async function fetchReg() {
    if(!user) return setReg(null);
    try {
      setReg(await dispatch(get(`/conference/${match.params.id}/registrant/${user._id}`)));
    } catch(e) {
      if(e.code === 404) return;
      throw e;
    }
  };

  async function fetchPayments() {
    if(!user) return setPayments([]);
    try {
      setPayments(await dispatch(get(`/conference/${match.params.id}/payment/${user._id}`)));
    } catch(e) {
      if(e.code === 404) return;
      throw e;
    }
  };

  async function fetchAssignments() {
    if(!user) return setAssignments([]);
    try {
      setAssignments(await dispatch(get(`/conference/${match.params.id}/assignment/${user._id}`)));
    } catch(e) {
      if(e.code === 404) return;
      throw e;
    }
  };

  async function fetchStat() {
    const stat = await dispatch(get(`/conference/${match.params.id}/stat`));
    setStat(stat);
  }

  async function fetchRole() {
    if(!user) return setRole(null);
    try {
      const role = (await dispatch(get(`/conference/${match.params.id}/role/${user._id}`))).role;
      setRole(role);

      if(role === 'moderator')
        await fetchStat();
    } catch(e) {
      if(e.code === 404) return setRole(null);
      throw e;
    }
  };

  useEffect(() => {
    updateConf();
    updateComms();
    fetchReg();
    fetchPayments();
    fetchAssignments();
    fetchRole();
  }, [match.params.id, dispatch, user]);

  function loadColor() {
    if(!conf) return;

    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = conf.background;
    image.onload = () => {
      const thief = new ColorThief();
      const dominant = thief.getColor(image);
      const chroma = Chroma(dominant);
      const primary = chroma.saturate().luminance(0.2);
      const dark = primary.darken(1);
      setColor({ main: primary.css(), disabled: dark.alpha(.5).css() });
    };
  }

  useEffect(loadColor, [conf]);

  const header = useCallback(({ scroll }) => {
    const threshold = 240 - 50 - 60 + 4;
    const ext = scroll > threshold;

    return <div className={clsx(cls.header, { [cls.headerExt]: ext })}>
      <div className={cls.headerLeft}>
        <div className={cls.logo}>
          <img alt="Logo" src={ conf ? conf.logo : '' } />
        </div>
        <div className={cls.names}>
          <Typography variant="h3" className={cls.abbr}>{ conf ? conf.abbr : '' }</Typography>
          <Typography variant="h2" className={cls.title}>{ conf ? conf.title : '' }</Typography>
        </div>
      </div>
      <Button
        variant="contained"
        style={{
          background: color && (reg !== null ? color.disabled : color.main),
        }}
        size="large"
        className={cls.join}
        color="secondary"
        onClick={openReg}

        disabled={reg !== null}
      >{reg !== null ? '已' : ''}报名</Button>
    </div>;
  }, [conf, color, openReg, reg]);

  const notiRegion = (!conf || !conf.publishes || conf.publishes.length === 0) ? <>
    <Typography variant="body1" className={cls.empty}>什么都还没有</Typography>
  </> : [...conf.publishes].reverse().map(pub => <Card className={cls.card} key={pub._id}>
    <CardContent>
      <Typography variant="h5">{ pub.title }</Typography>
      <Typography variant="body2">{ new Date(pub.date).toLocaleString() }</Typography>
      <Typography variant="body1" className={cls.postMain}>{ pub.main }</Typography>
    </CardContent>
  </Card>);

  const commsRegion = comms ?
    <>
      { comms.map(comm => <Card className={cls.card} key={comm._id}>
        <CardActionArea>
          <CardMedia
            className={cls.commBG}
            image={comm.background}
          >
            <div className={cls.backdrop} />
            <CardContent className={cls.commInfo}>
              <Typography variant="h6" className={cls.commAbbr}>{comm.abbr}</Typography>
              <Typography variant="h5" className={cls.commTitle}>{comm.title}</Typography>
            </CardContent>
          </CardMedia>
          <CardContent>
            <Typography variant="h5" className={cls.commSub}>{comm.subject}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>) }
    </> : null;

  const progress = reg ? ['reg', 'exam', 'interview', 'seating'].indexOf(reg.stage || 'reg') : 0;
  const progressCard = reg ? <Card className={cls.card}>
    <CardContent className={cls.progressContent}>
      <Typography variant="h5" gutterBottom>报名进度</Typography>

      <Stepper activeStep={progress}>
        <Step><StepLabel>报名</StepLabel></Step>
        <Step><StepLabel>学测</StepLabel></Step>
        <Step><StepLabel>面试</StepLabel></Step>
        <Step><StepLabel>席位分配</StepLabel></Step>
      </Stepper>
    </CardContent>
    <CardActions>
      <Button
        onClick={openRegDetail}
      >
        查看志愿详情
      </Button>
    </CardActions>
  </Card> : null;

  function generateAssignmentIcon(a) {
    if(a.submitted) return <Icon>done</Icon>;
    else if(new Date(a.deadline) < new Date()) return <Icon>timer_off</Icon>;
    return <Icon>hourglass_empty</Icon>;
  }

  function generateAssignmentDesc(a) {
    if(a.submitted) return '已提交';
    else if(new Date(a.deadline) < new Date()) return `已超时 - ${new Date(a.deadline).toLocaleString()}`;
    return `未提交 - DDL @ ${new Date(a.deadline).toLocaleString()}`;
  }

  function generatePaymentIcon(status) {
    if(status === 'paid') return <Icon>done</Icon>;
    else if(status === 'closed') return <Icon>close</Icon>;
    return <Icon>hourglass_empty</Icon>;
  }

  const assignmentsCard = (assignments && assignments.length > 0) ? <Card className={cls.card}>
    <Typography variant="h5" className={cls.listTitle}>学测</Typography>
    <List>
      { assignments.map(assignment => <ListItem button component={NavLink} to={`/assignment/${assignment._id}`} key={assignment._id}>
        <ListItemIcon>
          { generateAssignmentIcon(assignment) }
        </ListItemIcon>
        <ListItemText primary={assignment.title} secondary={generateAssignmentDesc(assignment)} />
      </ListItem>) }
    </List>
  </Card> : null;

  const paymentsCard = (payments && payments.length > 0) ? <Card className={cls.card}>
    <Typography variant="h5" className={cls.listTitle}>订单</Typography>
    <List>
      { payments.map(payment => <ListItem button component={NavLink} to={`/payment/${payment._id}`} key={payment._id}>
        <ListItemIcon>
          { generatePaymentIcon(payment.status) }
        </ListItemIcon>
        <ListItemText primary={`${calcTotal(payment)} CNY`} secondary={payment.desc} />
      </ListItem>) }
    </List>
  </Card> : null;

  const submitPost = useCallback(async content => {
    await dispatch(post(`/conference/${match.params.id}/publish`, content));
    await fetchConf();
    closePost();
  }, [match]);

  const [webhooksOpen, setWebhooksOpen] = useState(false);
  const toggleWebhooks = useCallback(() => setWebhooksOpen(!webhooksOpen), [webhooksOpen]);
  const tryAddWebhook = useCallback(async ev => {
    if(ev.key === 'Enter') {
      const webhook = ev.target.value;
      ev.target.value = '';
      const webhooks = [...stat.webhooks, webhook];
      await dispatch(post(`/conference/${match.params.id}/webhooks`, webhooks, 'PUT'));
      await fetchStat();
    }
  }, [stat]);
  const deleteWebhook = useCallback(async id => {
    const webhooks = [...stat.webhooks]
    webhooks.splice(id, 1);
    await dispatch(post(`/conference/${match.params.id}/webhooks`, webhooks, 'PUT'));
    await fetchStat();
  }, [stat]);

  const statInner = stat ? <List className={cls.statList}>
    <ListItem button component={NavLink} to={`/conference/${match.params.id}/admin/reg`}>
      <ListItemIcon><Icon>assignment_ind</Icon></ListItemIcon>
      <ListItemText primary={stat.regCount} secondary="报名人数" />
    </ListItem>

    <ListItem>
      <ListItemIcon><Icon>receipt</Icon></ListItemIcon>
      <ListItemText primary={stat.paymentCount} secondary="订单数" />
    </ListItem>

    <ListItem button onClick={toggleWebhooks}>
      <ListItemIcon><Icon>link</Icon></ListItemIcon>
      <ListItemText primary={stat.webhooks.length} secondary="Webhooks" />
      <Icon className={clsx(cls.expand, webhooksOpen ? cls.expandInverted : null)}>expand_more</Icon>
    </ListItem>
    <Collapse in={webhooksOpen} timeout="auto" unmountOnExit>
      <List disablePadding component="div" className={cls.nestedList}>
        <ListItem>
          <ListItemIcon><Icon>add</Icon></ListItemIcon>
          <InputBase
            className={cls.listNew}
            placeholder="https://example.com/path"
            onKeyDown={tryAddWebhook}
          />
        </ListItem>
        { stat.webhooks.map((hook, id) => <ListItem key={id}>
          <ListItemIcon><Icon>link</Icon></ListItemIcon>
          <ListItemText primary={hook} />
          <ListItemSecondaryAction>
            <IconButton onClick={() => deleteWebhook(id)}><Icon>delete</Icon></IconButton>
          </ListItemSecondaryAction>
        </ListItem>) }
      </List>
    </Collapse>
  </List> : <Loading />;

  const statCard = role === 'moderator' ? <Card className={cls.card}>
    <Typography variant="h5" className={cls.listTitle} gutterBottom>管理</Typography>
    { statInner }
  </Card> : null;

  const inner = conf ?
    <>
      <Typography variant="h4" className={cls.subtitle}>
        近期公告
        { role === 'moderator' ?
            <IconButton
              className={cls.subtitleBtn}
              onClick={openPost}
            ><Icon>add</Icon></IconButton>
            : null }
      </Typography>
      <PostEdit
        open={postOpen}
        onClose={closePost}
        onSubmit={submitPost}
      />
      { notiRegion }
      <Typography variant="h4" className={cls.subtitle}>委员会</Typography>
      { commsRegion }
    </> : null;

  const submitReg = useCallback(async (reg, extra) => {
    if(submitting) return;
    setSubmitting(true);

    try {
      await dispatch(post(`/conference/${match.params.id}/registrant/${user._id}`, { reg, extra }, 'PUT'));
      await fetchReg();

      await dispatch(refresh());
      enqueueSnackbar('报名成功！', {
        variant: 'success',
      });
    } catch(e) {
      console.error(e);
      enqueueSnackbar('提交失败，请稍后再试', {
        variant: 'error',
      });
    }
    setSubmitting(false);
    closeReg();
  }, [closeReg, user, enqueueSnackbar]);

  return <HeaderLayout img={conf ? conf.background : ''} floating={header} pad={70 + 16 * 2 - 4 - 28} height={240}>
    { statCard }
    { progressCard }
    { assignmentsCard }
    { paymentsCard }
    { inner }

    <RegDialog
      comms={comms}

      open={regOpen}
      onClose={closeReg}
      fullWidth

      onSubmit={submitReg}
      disabled={submitting}
    />

    <RegDetailDialog
      comms={comms}

      open={regDetailOpen}
      onClose={closeRegDetail}
      fullWidth

      value={reg ? reg.reg : null}
    />
  </HeaderLayout>;
});

const regStyles = makeStyles(theme => ({
  badge: {
    position: 'absolute',
    left: 10,
  },

  badgeAnchor: {
    width: 0,
    position: 'relative',
  },

  commInfo: {
    transition: 'transform .2s ease',
    paddingLeft: '0',
  },

  selected: {
    '& $commInfo': {
      transform: 'translate(32px)',
    },
  },

  item: {
    overflow: 'hidden',
  },

  directionComm: {
    marginBottom: theme.spacing.unit,
  },

  directionHint: {
    fontSize: 16,
    lineHeight: '20px',
    color: 'rgba(0,0,0,.54)',
  },

  extra: {
    margin: '5px 0 20px 0',
  },

  dialogRoot: {
    width: 'calc(100% - 96px)',
  },
}));

function getSelectedComms(first, comms) {
  const keys = first.keySeq().toJS().sort((a, b) => first.get(a) - first.get(b));

  const allComms = {};
  for(const comm of comms) allComms[comm._id] = comm;
  return keys.map(k => allComms[k]);
}

function generateDefaultSecond(first, comms, original = new Map()) {
  const selected = getSelectedComms(first, comms);
  let result = original; 

  selected.forEach(({ _id, special }) => {
    if(result.has(_id)) return; // Don't touch existing values

    if(special === 'crisis') {
      const submap = new Map()
        .set(1, new Map())
        .set(2, new Map())
        .set('SC', false)
        .set('MPC', false);

      result = result.set(_id, submap);
    }
  });

  return result;
}

function toggleMap(map, id) {
  const cur = map.get(id);
  if(!cur) return map.set(id, map.size + 1);
  else {
    let modified = map;
    const keys = map.keySeq();
    keys.forEach(k => {
      const kcur = modified.get(k);
      if(kcur > cur)
        modified = modified.set(k, kcur - 1);
    });

    return modified.delete(id);
  }
}

function blockSecondary(special) {
  return special === 'crisis';
}

function noSecond(first, comms) {
  const selected = getSelectedComms(first, comms);
  return selected.every(e => e.special !== 'crisis');
}

function renderLastStep(comm, index, value, cls) {
  if(comm.special === 'crisis') {
    let buckets;
    if(value instanceof Map)
      buckets = value.toJS();
    else
      buckets = { ...value };

    for(const key in buckets)
      if(typeof buckets[key] === 'object')
        buckets[key] = Object.keys(buckets[key]).sort((a, b) => buckets[key][a] - buckets[key][b]);

    return <React.Fragment key={index}>
      <DialogContent>
        <Typography variant="h6" className={cls.directionHint}>第 { index + 1 } 志愿</Typography>
        <Typography variant="h6" className={cls.directionComm}>{ comm.title }</Typography>

        <DialogContentText>特殊席位</DialogContentText>
        <List>
          { buckets.SC ? <ListItem><ListItemIcon><Icon>done</Icon></ListItemIcon><ListItemText primary="可能得到安理会席位" /></ListItem> : null }
          { buckets.MPC ? <ListItem><ListItemIcon><Icon>done</Icon></ListItemIcon><ListItemText primary="可能得到 MPC 席位" /></ListItem> : null }
        </List>

        { [1,2].map(level => <React.Fragment key={level}>
          <DialogContentText>第 { level } 级方向</DialogContentText>
          <List>
            { (buckets[level] || []).map((tag, index) => <ListItem
              key={tag}
            >
              <ListItemText
                primary={tag}
                secondary={`第 ${index + 1} 志愿方向`}
              />
            </ListItem>) }
          </List>
        </React.Fragment>) }
      </DialogContent>
    </React.Fragment>;
  } else {
    return <React.Fragment key={index}>
      <DialogContent>
        <Typography variant="h6" className={cls.directionHint}>第 { index + 1 } 志愿</Typography>
        <Typography variant="h6" className={cls.directionComm}>{ comm.title }</Typography>

        <DialogContentText>此委员会不需要额外选择方向</DialogContentText>
      </DialogContent>
    </React.Fragment>;
  }
}

// Reg dialog
const RegDialog = React.memo(({ comms: _comms, onSubmit, disabled, ...rest }) => {
  const cls = regStyles();

  const [step, setStep] = useState(0);
  const [first, setFirst] = useState(new Map());
  const [second, setSecond] = useState(new Map());
  const [extra, setExtra] = useState('');

  const changeExtra = useCallback(ev => {
    setExtra(ev.target.value);
  }, [setExtra]);

  const comms = _comms || [];

  const gotoNext = useCallback(() => {
    if(step === 0) {
      setSecond(generateDefaultSecond(first, comms, second));

      if(noSecond(first, comms)) {
        setStep(step+2);
        return;
      }
    }

    setStep(step+1)
  }, [step, first, comms, second]);
  const gotoPrev = useCallback(() => {
    if(step === 0) return;

    if(step === 2 && noSecond(first, comms)) {
      setStep(0);
      return;
    }

    setStep(step-1);
  }, [first, comms, step]);

  function generateStep() {
    if(step === 0) {
      const toggle = id => () => setFirst(toggleMap(first, id));

      return <>
        <DialogContent>
          <DialogContentText>感谢您对本会议的支持！</DialogContentText>
          <DialogContentText>请您按顺序依次点选 <strong>两个</strong> 志愿委员会</DialogContentText>
          <List>
            { comms.map(({ title, abbr, _id, special }) => {
              const b2 = blockSecondary(special);
              let hint = abbr;
              if(b2)
                hint += ' - 仅第一志愿';

              return <ListItem
                button
                disabled={!first.has(_id) && first.size !== 0 && b2}
                key={_id}
                onClick={toggle(_id)}
                className={clsx(cls.item, { [cls.selected]: first.has(_id) })}
              >
                <div className={cls.badgeAnchor}>
                  <Badge
                    className={cls.badge}
                    badgeContent={first.get(_id)}
                    invisible={!first.has(_id)}
                    color="secondary"
                  >
                    <div className={cls.badgeInner}/>
                  </Badge>
                </div>
                <ListItemText
                  primary={title}
                  secondary={hint}
                  className={cls.commInfo}
                />
              </ListItem>;
            })}
          </List>
        </DialogContent>
      </>;
    } else if(step === 1) {
      function commRender(comm, index, value, setValue) {
        if(comm.special === 'crisis') {
          const buckets = {};
          for(const { tag, meta } of comm.targets) {
            const level = meta.level || 1;
            if(!buckets[level]) buckets[level] = [];
            buckets[level].push(tag);
          }

          const toggle = (level, id) => () => setValue(value.set(level, toggleMap(value.get(level), id)));

          return <>
            <DialogContent>
              <Typography variant="h6" className={cls.directionHint}>第 { index + 1 } 志愿</Typography>
              <Typography variant="h6" className={cls.directionComm}>{ comm.title }</Typography>

              <DialogContentText>请填写特殊席位意愿，并依次在下方两个级别的方向中 <strong>按志愿顺序</strong> 各做出 <strong>两个</strong> 选择</DialogContentText>
            </DialogContent>

            <DialogContent>
              <DialogContentText>特殊席位意愿</DialogContentText>
              <List>
                <ListItem>
                  <ListItemText primary="我希望得到安理会席位" />
                  <ListItemSecondaryAction>
                    <Checkbox
                      onChange={() => setValue(value.set('SC', !value.get('SC')))}
                      checked={value.get('SC')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="我希望得到 MPC 席位" />
                  <ListItemSecondaryAction>
                    <Checkbox
                      onChange={() => setValue(value.set('MPC', !value.get('MPC')))}
                      checked={value.get('MPC')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              { [1,2].map(level => <>
                <DialogContentText>第 { level } 级方向</DialogContentText>
                <List>
                  { (buckets[level] || []).map(tag => <ListItem
                    button
                    key={tag}
                    onClick={toggle(level, tag)}
                    className={clsx(cls.item, { [cls.selected]: value.get(level).has(tag) })}
                  >
                    <div className={cls.badgeAnchor}>
                      <Badge
                        className={cls.badge}
                        badgeContent={value.get(level).get(tag)}
                        invisible={!value.get(level).has(tag)}
                        color="secondary"
                      >
                        <div className={cls.badgeInner}/>
                      </Badge>
                    </div>
                    <ListItemText
                      primary={tag}
                      className={cls.commInfo}
                    />
                  </ListItem>) }
                </List>
              </>) }
            </DialogContent>
          </>;
        } else {
          return <>
            <DialogContent>
              <Typography variant="h6" className={cls.directionHint}>第 { index + 1 } 志愿</Typography>
              <Typography variant="h6" className={cls.directionComm}>{ comm.title }</Typography>

              <DialogContentText>此委员会不需要额外选择方向</DialogContentText>
            </DialogContent>
          </>;
        }
      }

      const selected = getSelectedComms(first, comms);

      const inner = selected.map((comm, index) =>
        commRender(comm, index, second.get(comm._id), newValue =>  setSecond(second.set(comm._id, newValue))));

      return <>
        <DialogContent>
          <DialogContentText>请您填写各个委员会中的志愿方向</DialogContentText>
        </DialogContent>

        { inner }
      </>;
    } else {
      // Last step
      const selected = getSelectedComms(first, comms);

      const inner = selected.map((comm, index) =>
        renderLastStep(comm, index, second.get(comm._id), cls));

      return <>
        <DialogContent>
          <TextField
            label="备注"
            fullWidth
            multiline
            variant="filled"
            className={cls.extra}

            value={extra}
            onChange={changeExtra}
          />
          <DialogContentText>请检查您的报名志愿信息是否正确。提交后您将 <strong>无法</strong> 修改这些信息。</DialogContentText>
          <DialogContentText>我们会尽快根据您的志愿信息为您分配学测。届时，您的邮箱将会收到通知邮件，请保持关注。</DialogContentText>
        </DialogContent>

        { inner }
      </>;
    }
  }

  const content = useMemo(generateStep, [comms, step, first, second, extra]);

  const canNext = useMemo(() => {
    if(step === 0)
      return first.size === 2;
    else if(step === 1) {
      const selected = getSelectedComms(first, comms);
      let flag = true;
      selected.forEach(({ _id, special }) => {
        if(special === 'crisis')
          flag = flag && second.get(_id).get(1).size === 2
            && second.get(_id).get(2).size === 2;
      });

      return flag;
    } else return true;
  }, [step, first, second]);

  const submit = useCallback(() => {
    const result = getSelectedComms(first, comms).map(({ _id, slug }) => {
      const payload = second.has(_id) ? second.get(_id).toJS() : undefined;
      return {
        committee: slug,
        payload,
      }
    });

    if(onSubmit)
      onSubmit(result, extra);
  }, [first, second, comms, extra]);

  return <Dialog {...rest} scroll="body" classes={{
    paper: cls.dialogRoot,
  }}>
    <Stepper activeStep={step} color="secondary">
      <Step color="inherit"><StepLabel>选择委员会志愿</StepLabel></Step>
      <Step color="inherit" completed={step > 1 && !noSecond(first, comms)}><StepLabel>选择方向</StepLabel></Step>
      <Step color="inherit"><StepLabel>备注 &amp; 确认</StepLabel></Step>
    </Stepper>

    { content }

    <DialogActions>
      { step !== 0 ? <Button onClick={gotoPrev}>上一步</Button> : null }
      { step !== 2 ? <Button variant="contained" color="secondary" onClick={gotoNext} disabled={!canNext}>下一步</Button> : null }
      { step === 2 ? <Button variant="contained" color="secondary" onClick={submit} disabled={disabled || !canNext}>确认提交</Button> : null }
    </DialogActions>
  </Dialog>;
});

// RegDetail

export const RegDetailDialog = React.memo(({ comms: _comms, value, ...rest }) => {
  const cls = regStyles();

  if(!value) return null;

  const comms = _comms || [];
  const mapper = comms.reduce((acc, comm) => acc.set(comm.slug, comm), new Map());
  const inner = value.flatMap(({ committee, payload }, index) => {
    const comm = mapper.get(committee);
    if(!comm) return [];
    return [renderLastStep(comm, index, payload, cls)];
  });

  return <Dialog {...rest} scroll="body" classes={{
    paper: cls.dialogRoot,
  }}>
    { inner }
  </Dialog>;
});
