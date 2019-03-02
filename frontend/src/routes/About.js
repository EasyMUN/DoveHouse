import React, { useState, useCallback, useContext } from 'react';

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

import { post, refresh } from '../store/actions';

import { gravatar } from '../util';

import { useSnackbar } from '../Snackbar';

import BasicLayout from '../layout/Basic';

const styles = makeStyles(theme => ({
  header: {
    textAlign: 'center',
    marginBottom: 2*theme.spacing.unit,
  },

  brand: {
    '& > *': {
      display: 'inline-block',
    },

    marginBottom: theme.spacing.unit,
  },

  brandFirst: {
    fontWeight: 500,
  },

  brandSecond: {
    fontWeight: 200,
  },

  powered: {
    fontSize: 20,
    color: 'rgba(0,0,0,.38)',
  },
}));

export default React.memo(() => {
  const cls = styles();

  return <BasicLayout>
    <div className={cls.header}>
      <div className={cls.brand}>
        <Typography variant="h2" className={cls.brandFirst}>{ BRAND_PRIMARY }</Typography>
        <Typography variant="h2" className={cls.brandSecond}>{ BRAND_SECONDARY }</Typography>
      </div>

      <Typography variant="h4" className={cls.powered}>Powered by DoveHouse</Typography>
    </div>

    <List>
      <ListItem button component="a" href={ `mailto:${CONTACT}` } target="_blank">
        <ListItemIcon><Icon>alternate_email</Icon></ListItemIcon>
        <ListItemText primary="联系我们" secondary={CONTACT} />
      </ListItem>

      <ListItem button component="a" href="https://github.com/EasyMUN/dovehouse" target="_blank">
        <ListItemIcon><Icon>code</Icon></ListItemIcon>
        <ListItemText primary="查看开源代码" secondary="EasyMUN/dovehouse" />
      </ListItem>
    </List>
  </BasicLayout>;
});
