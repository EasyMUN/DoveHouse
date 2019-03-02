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
    marginTop: 40,
    maxWidth: 700,
    margin: '0 auto',
    padding: '0 20px',
  },

  toolbar: {
    height: 400,
    position: 'sticky',
    width: '100%',
    top: -340,
    left: 0,
    right: 0,
    zIndex: 900,

    transition: 'box-shadow .2s ease, background .2s ease',
  },

  toolbarFloating: {
    boxShadow: 'rgba(0,0,0,.3) 0 4px 12px',
  },

  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',

    backgroundPosition: 'center',
    backgroundSize: 'cover',
  },

  color: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',

    pointerEvents: 'none',

    background: theme.palette.primary.light,
  },

  header: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  headerInner: {
    maxWidth: 700,
    margin: '0 auto',
    padding: '0 20px',
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

export default React.memo(({ img, children, header }) => {
  const cls = styles();

  const [onTop, setOnTop] = useState(true);
  const [percentage, setPercentage] = useState(0);

  const scrollCB = useCallback(ev => {
    const scrollTop = ev.target.scrollTop;

    const totalScroll = 400-60;
    const percentage = scrollTop / totalScroll;

    if(percentage > 1) setPercentage(1);
    else setPercentage(percentage);

    setOnTop(percentage < 1);
  });

  return <div className={cls.wrapper} onScroll={scrollCB}>
    <div className={clsx(cls.toolbar, { [cls.toolbarFloating]: !onTop })}>
      <div className={cls.image} style={{
        backgroundImage: `url(${img})`,
      }}></div>
      <div className={cls.backdrop} />
      <div className={cls.header}>
        <div className={cls.headerInner}>
          { header }
        </div>
      </div>
      <div className={cls.color} style={{
        opacity: percentage,
      }}></div>
    </div>
    <div className={cls.inner}>
      { children }
    </div>
  </div>;
});
