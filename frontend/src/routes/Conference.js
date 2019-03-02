import React, { useEffect, useState, useCallback, useContext } from 'react';

import { makeStyles } from '@material-ui/styles';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

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
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
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

  join: {
    marginLeft: theme.spacing.unit * 2,
  },

  imageStub: {
    opacity: 0,
    position: 'absolute',
    top: '-100%',
  },
}));

export default React.memo(() => {
  const cls = styles();

  const { match } = useRouter();

  const [conf, setConf] = useState(null);
  const [color, setColor] = useState(null);

  const dispatch = useDispatch();

  async function fetchData() {
    const conf = await dispatch(get(`/conference/${match.params.id}`));
    setConf(conf);
  }

  useEffect(() => {
    fetchData();
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

  const header = <div className={cls.header}>
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
    >报名</Button>
  </div>;

  const inner = conf ?
    <>
      <Typography variant="h4">近期公告</Typography>
    </> : null;

  return <HeaderLayout img={conf ? conf.background : ''} header={header}>
    { inner }
  </HeaderLayout>;
});
