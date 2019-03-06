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

import { get } from '../store/actions';

import { gravatar } from '../util';

import { useRouter } from '../Router';

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
}));

export default React.memo(() => {
  const cls = styles();

  const { match } = useRouter();

  const [conf, setConf] = useState(null);
  const [comms, setComms] = useState(null);
  const [color, setColor] = useState(null);
  const [reg, setReg] = useState(false);

  const closeReg = useCallback(() => setReg(false), [setReg]);
  const openReg = useCallback(() => setReg(true), [setReg]);

  const dispatch = useDispatch();

  async function fetchConf() {
    const conf = await dispatch(get(`/conference/${match.params.id}`));
    setConf(conf);
  };

  async function fetchComms() {
    const comms = await dispatch(get(`/conference/${match.params.id}/committee`));
    setComms(comms);
  };

  useEffect(() => {
    fetchConf();
    fetchComms();
  }, [match.params.id, dispatch]);

  function loadColor() {
    if(!conf) return;

    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = conf.background;
    image.onload = () => {
      const thief = new ColorThief();
      const dominant = thief.getColor(image);
      const chroma = Chroma(dominant);
      const css = chroma.saturate().luminance(0.2).css();
      setColor(css);
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
          background: color
        }}
        size="large"
        className={cls.join}
        color="secondary"
        onClick={openReg}
      >报名</Button>
    </div>;
  }, [conf, color, openReg]);

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
      <Typography variant="h4" className={cls.subtitle}>委员会</Typography>
      { commsRegion }
    </> : null;

  return <HeaderLayout img={conf ? conf.background : ''} floating={header} pad={70 + 16 * 2 - 4 - 28} height={240}>
    { inner }

    <RegDialog
      comms={comms}

      open={reg}
      onClose={closeReg}
      fullWidth
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

function generateDefaultSecond(first, comms) {
  const selected = getSelectedComms(first, comms);
  let result = new Map();

  selected.forEach(({ special }, index) => {
    if(special === 'crisis') {
      const submap = new Map()
        .set(1, new Map())
        .set(2, new Map())
        .set(3, new Map());

      result = result.set(index, submap);
    } else {
      result = result.set(index, new Map());
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
const RegDialog = ({ comms: _comms, ...rest }) => {
  const cls = regStyles();

  const [step, setStep] = useState(0);
  const [first, setFirst] = useState(new Map());
  const [second, setSecond] = useState(null);

  const gotoNext = useCallback(() => {
    if(step === 0) setSecond(generateDefaultSecond(first, comms));

    setStep(step+1)
  }, [step, first, comms]);
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
              <Typography variant="h6">{ comm.title }</Typography>

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
        commRender(comm, index, second.get(index), newValue =>  setSecond(second.set(index, newValue))));

      return <>
        <DialogContent>
          <DialogContentText>请您填写各个委员会中的志愿方向</DialogContentText>
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
      selected.forEach(({ special }, index) => {
        if(special === 'crisis')
          flag = flag && second.get(index).get(1).size === 2
            && second.get(index).get(2).size === 2
            && second.get(index).get(3).size === 2;

        // TODO: implement other types
      });

      return flag;
    }
  }, [step, first, second]);

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
      { step === 2 ? <Button variant="contained" color="secondary" onClick={gotoNext} disabled={!canNext}>确认提交</Button> : null }
    </DialogActions>
  </Dialog>;
};
