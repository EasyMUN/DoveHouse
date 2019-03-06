import React, { useMemo, useEffect, useState, useCallback, useContext } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import { Map } from 'immutable';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Badge from '@material-ui/core/Badge';

import { CONTACT, BRAND_PRIMARY, BRAND_SECONDARY } from '../config';

import { get, post } from '../store/actions';

import { gravatar } from '../util';

import { useRouter } from '../Router';
import { NavLink } from 'react-router-dom';

import { useSnackbar } from '../Snackbar';

import HeaderLayout from '../layout/Header';

import ColorThief from 'color-thief';
import Chroma from 'chroma-js';

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
      fontWeight: 200,
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
  },

  logo: {
    padding: 5,
    background: 'rgba(255,255,255,.8)',
    height: 70,
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
  },

  title: {
    fontSize: 32,
    fontWeight: 600,
    lineHeight: '40px',
    color: 'rgba(255,255,255,.87)',
  },

  abbr: {
    fontSize: 24,
    lineHeight: '28px',
    color: 'rgba(255,255,255,.54)',
  },

  subtitle: {
    marginTop: 4*theme.spacing.unit,
  },

  join: {
    marginLeft: theme.spacing.unit * 2,
  },

  imageStub: {
    opacity: 0,
    position: 'absolute',
    top: '-100%',
  },

  commCard: {
    marginTop: theme.spacing.unit,
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
    fontWeight: 200,
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
}));

export default React.memo(() => {
  const cls = styles();

  const { match } = useRouter();

  const [conf, setConf] = useState(null);
  const [comms, setComms] = useState(null);
  const [reg, setReg] = useState(null);
  const [color, setColor] = useState(null);
  const [regOpen, setRegOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const closeReg = useCallback(() => setRegOpen(false), [setRegOpen]);
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

  const dispatch = useDispatch();
  const { user } = useMappedState(({ user }) => ({ user }));

  async function fetchConf() {
    const conf = await dispatch(get(`/conference/${match.params.id}`));
    setConf(conf);
  };

  async function fetchComms() {
    const comms = await dispatch(get(`/conference/${match.params.id}/committee`));
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

  useEffect(() => {
    fetchConf();
    fetchComms();
    fetchReg();
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
          <img src={ conf ? conf.logo : '' } />
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

  const notiRegion = <>
    <Typography variant="body1" className={cls.empty}>什么都还没有</Typography>
  </>;

  const commsRegion = comms ?
    <>
      { comms.map(comm => <Card className={cls.commCard} key={comm._id}>
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

  const inner = conf ?
    <>
      <Typography variant="h4" className={cls.subtitle}>近期公告</Typography>
      { notiRegion }
      <Typography variant="h4" className={cls.subtitle}>委员会</Typography>
      { commsRegion }
    </> : null;

  const submitReg = useCallback(async submission => {
    if(submitting) return;
    setSubmitting(true);

    console.log(submission);
    try {
      await dispatch(post(`/conference/${match.params.id}/registrant/${user._id}`, submission, 'PUT'));
      await fetchReg();

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
    { inner }

    <RegDialog
      comms={comms}

      open={regOpen}
      onClose={closeReg}
      fullWidth

      onSubmit={submitReg}
      disabled={submitting}
    />
  </HeaderLayout>;
});

const regStyles = makeStyles(theme => ({
  badge: {
    position: 'absolute',
    left: 26,
  },

  badgeAnchor: {
    width: 0,
    position: 'relative',
  },

  commInfo: {
    transition: 'transform .2s ease',
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
        .set(3, new Map());

      result = result.set(_id, submap);
    } else {
      result = result.set(_id, new Map());
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

// Reg dialog
const RegDialog = ({ comms: _comms, onSubmit, disabled, ...rest }) => {
  const cls = regStyles();

  const [step, setStep] = useState(0);
  const [first, setFirst] = useState(new Map());
  const [second, setSecond] = useState(new Map());

  const gotoNext = useCallback(() => {
    if(step === 0) setSecond(generateDefaultSecond(first, comms, second));

    setStep(step+1)
  }, [step, first, comms, second]);
  const gotoPrev = useCallback(() => step === 0 || setStep(step-1), [step]);

  const comms = _comms || [];

  function generateStep() {
    if(step === 0) {
      const toggle = id => () => setFirst(toggleMap(first, id));

      return <>
        <DialogContent>
          <DialogContentText>感谢您对本会议的支持！</DialogContentText>
          <DialogContentText>请您按顺序依次点选您的志愿委员会</DialogContentText>
        </DialogContent>
        <List>
          { comms.map(({ title, abbr, _id }) => <ListItem
            button
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
              secondary={abbr}
              className={cls.commInfo}
            />
          </ListItem>) }
        </List>
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

              <DialogContentText>请依次在下方三个级别的方向中 <strong>按志愿顺序</strong> 各做出 <strong>两个</strong> 选择</DialogContentText>
            </DialogContent>

            <DialogContent>
              { [1,2,3].map(level => <>
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
          // TODO: implement
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
      function commRender(comm, index, value) {
        if(comm.special === 'crisis') {
          const buckets = value.toJS();
          for(const key in buckets)
            buckets[key] = Object.keys(buckets[key]).sort((a, b) => buckets[key][a] - buckets[key][b]);

          return <>
            <DialogContent>
              <Typography variant="h6" className={cls.directionHint}>第 { index + 1 } 志愿</Typography>
              <Typography variant="h6" className={cls.directionComm}>{ comm.title }</Typography>

              { [1,2,3].map(level => <>
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
              </>) }
            </DialogContent>
          </>;
        } else {
          // TODO: implement
        }
      }

      const selected = getSelectedComms(first, comms);

      const inner = selected.map((comm, index) =>
        commRender(comm, index, second.get(comm._id)));

      return <>
        <DialogContent>
          <DialogContentText>请检查您的报名志愿信息是否正确。提交后您将 <strong>无法</strong> 修改这些信息。</DialogContentText>
          <DialogContentText>我们会尽快根据您的志愿信息为您分配学测。届时，您的邮箱将会收到通知邮件，请保持关注。</DialogContentText>
        </DialogContent>

        { inner }
      </>;
    }
  }

  const content = useMemo(generateStep, [comms, step, first, second]);

  const canNext = useMemo(() => {
    if(step === 0)
      return first.size !== 0;
    else if(step === 1) {
      const selected = getSelectedComms(first, comms);
      let flag = true;
      selected.forEach(({ _id, special }) => {
        if(special === 'crisis')
          flag = flag && second.get(_id).get(1).size === 2
            && second.get(_id).get(2).size === 2
            && second.get(_id).get(3).size === 2;

        // TODO: implement other types
      });

      return flag;
    } else return true;
  }, [step, first, second]);

  const submit = useCallback(() => {
    const result = getSelectedComms(first, comms).map(({ _id }) => ({
      committee: _id,
      payload: second.get(_id).toJS(),
    }));

    if(onSubmit)
      onSubmit(result);
  }, [first, second, comms]);

  return <Dialog {...rest} scroll="body">
    <Stepper activeStep={step} color="secondary">
      <Step color="inherit"><StepLabel>选择委员会志愿</StepLabel></Step>
      <Step color="inherit"><StepLabel>选择方向</StepLabel></Step>
      <Step color="inherit"><StepLabel>确认</StepLabel></Step>
    </Stepper>

    { content }

    <DialogActions>
      { step !== 0 ? <Button onClick={gotoPrev}>上一步</Button> : null }
      { step !== 2 ? <Button variant="contained" color="secondary" onClick={gotoNext} disabled={!canNext}>下一步</Button> : null }
      { step === 2 ? <Button variant="contained" color="secondary" onClick={submit} disabled={disabled || !canNext}>确认提交</Button> : null }
    </DialogActions>
  </Dialog>;
};
