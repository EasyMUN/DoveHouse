import React, { useEffect, useState, useCallback, useRef } from 'react';

import { makeStyles } from '@material-ui/styles';

import clsx from 'clsx';

import { useDispatch } from 'redux-react-hook';

import { persistScroll, fetchScroll } from '../store/actions';

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
    paddingBottom: 60,
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

export default React.memo(({ children, onScroll, syncScroll }) => {
  const cls = styles();

  const [onTop, setOnTop] = useState(true);

  const scrollRef = useRef();

  const dispatch = useDispatch();

  useEffect(() => {
    if(!syncScroll) return;
    const scroll = dispatch(fetchScroll(syncScroll));
    if(!scroll) return;
    if(!scrollRef) return;
      scrollRef.current.scrollTop = scroll;
  }, [scrollRef, syncScroll]);

  const scrollCB = useCallback(ev => {
    if(ev.target !== scrollRef.current)
      return;

    const scrollTop = ev.target.scrollTop;
    setOnTop(scrollTop === 0);

    if(onScroll) onScroll();

    if(syncScroll)
      dispatch(persistScroll(syncScroll, scrollTop));
  }, [onScroll, scrollRef, syncScroll]);

  return <div className={cls.wrapper} onScroll={scrollCB} ref={scrollRef}>
    <div className={clsx(cls.toolbar, { [cls.toolbarFloating]: !onTop })}></div>
    <div className={cls.toolbarSpacer}></div>
    <div className={cls.inner}>
      { children }
    </div>
  </div>;
});
