import React from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

const styles = makeStyles(theme => ({
  container: {
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
  },
}));

export default React.memo(({ className, color, ...rest }) => {
  const cls = styles();

  return <div className={clsx(className, cls.container)}>
    <CircularProgress color={ color || 'secondary' } />
  </div>;
});
