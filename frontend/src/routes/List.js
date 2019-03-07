import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/styles';

import { useDispatch } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';

import { get } from '../store/actions';

import { NavLink } from 'react-router-dom';

import BasicLayout from '../layout/Basic';

const styles = makeStyles(theme => ({
  backdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    background: 'linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 70%)',
  },

  card: {
    marginTop: theme.spacing.unit,
  },

  bg: {
    paddingBottom: '20%',
    position: 'relative',
    minHeight: 120,
  },

  info: {
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

  title: {
    color: 'rgba(255,255,255,.87)',
    fontWeight: 600,
  },

  abbr: {
    color: 'rgba(255,255,255,.54)',
    lineHeight: '20px',
    fontSize: 18,
    fontWeight: 200,
  },
}));

export default React.memo(() => {
  const cls = styles();

  const [confs, setConfs] = useState(null);

  const dispatch = useDispatch();

  async function fetchConfs() {
    setConfs(await dispatch(get('/conference')));
  }

  useEffect(() => {
    fetchConfs();
  }, []);

  const inner = confs ?
    confs.map(conf => <Card className={cls.card} key={conf._id}>
      <NavLink to={`/conference/${conf._id}`}>
        <CardActionArea>
          <CardMedia
            className={cls.bg}
            image={conf.background}
          >
            <div className={cls.backdrop} />
            <CardContent className={cls.info}>
              <Typography variant="h6" className={cls.abbr}>{conf.abbr}</Typography>
              <Typography variant="h5" className={cls.title}>{conf.title}</Typography>
            </CardContent>
          </CardMedia>
        </CardActionArea>
      </NavLink>
    </Card>) : null;

  return <BasicLayout>
    { inner }
  </BasicLayout>;
});
