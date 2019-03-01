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
    position: 'fixed',
    width: '100%',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 900,

    transition: 'box-shadow .2s ease, background .2s ease',
  },

  toolbarSpacer: {
    height: 60,
  },

  toolbarFloating: {
    boxShadow: 'rgba(0,0,0,.3) 0 4px 12px',
    background: theme.palette.primary.light,
  },
}));

export default React.memo(({ children }) => {
  const cls = styles();

  const [onTop, setOnTop] = useState(true);

  const scrollCB = useCallback(ev => {
    const scrollTop = ev.target.scrollTop;
    setOnTop(scrollTop === 0);
  });

  return <div className={cls.wrapper} onScroll={scrollCB}>
    <div className={clsx(cls.toolbar, { [cls.toolbarFloating]: !onTop })}></div>
    <div className={cls.toolbarSpacer}></div>
    <div className={cls.inner}>
      { children }
    </div>
  </div>;
});
