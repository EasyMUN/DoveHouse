import React, { useState, useCallback } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import Avatar from '@material-ui/core/Avatar';

import { gravatar } from '../util';

const styles = makeStyles(theme => ({
  root: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: '50%',
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  avatarFallback: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
}));

export default React.memo(({ name, email, size, className, ...rest }) => {
  const cls = styles();

  return <div className={clsx(cls.root, className)} {...rest} style={{
    width: size,
    height: size,
  }}>
  <Avatar className={cls.avatarFallback} style={{
    fontSize: `${size / 40 * 1.25}rem`
  }}>{ name.slice(0, 1) }</Avatar>
    <Avatar className={cls.avatar} src={gravatar(email, size)} />
  </div>;
})
