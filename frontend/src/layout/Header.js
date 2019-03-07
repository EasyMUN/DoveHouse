import React, { useState, useCallback } from 'react';

import { makeStyles } from '@material-ui/styles';

import clsx from 'clsx';

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
    paddingBottom: 60,
  },

  toolbar: {
    position: 'sticky',
    width: '100%',
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

  backdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    background: 'linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 70%)',
  },
}));

export default React.memo(({ img, children, header, floating, pad = 0, height = 400 }) => {
  const cls = styles();

  const [scroll, setScroll] = useState(0);

  const onTop = scroll < height - 60;
  const percentage = Math.min(scroll / (height - 60), 1);

  const scrollCB = useCallback(ev => {
    setScroll(ev.target.scrollTop);
  });

  return <div className={cls.wrapper} onScroll={scrollCB}>
    <div className={clsx(cls.toolbar, { [cls.toolbarFloating]: !onTop })} style={{
      height: height + pad,
      top: -height + 60,
    }}>
      <div className={cls.image} style={{
        backgroundImage: `url(${img})`,
      }}></div>
      <div className={cls.backdrop} />
      { header ?
          <div className={cls.header}>
            { header({ onTop, percentage, scroll }) }
          </div> : null }
      <div className={cls.color} style={{
        opacity: percentage,
      }}></div>
      { floating ? 
          <div className={cls.header}>
            { floating({ onTop, percentage, scroll }) }
          </div>
          : null }
    </div>
    <div className={cls.inner}>
      { children }
    </div>
  </div>;
});
