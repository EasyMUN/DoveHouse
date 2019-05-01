import React, { useMemo, useCallback, useState, useEffect } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '../overrides/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { useRouter } from '../Router';

import { NavLink } from 'react-router-dom';

import { post, login } from '../store/actions';

import { useSnackbar } from '../Snackbar';

import BasicLayout from '../layout/Basic';

const styles = makeStyles(theme => ({
  card: {
    marginTop: 20,
  },

  pageTitle: {
    color: 'rgba(0,0,0,.54)',
    marginBottom: 40,
    marginTop: theme.spacing.unit,
  },
}));

export default React.memo(() => {
  const cls = styles();

  const { enqueueSnackbar } = useSnackbar();

  const [sudo, setSudo] = useState('');
  const changeSudo = useCallback(ev => setSudo(ev.target.value));
  const detectSudo = useCallback(async ev => {
    if(ev.key === 'Enter') {
      try {
        const { token } = await dispatch(post('/login', { _id: sudo }, 'PUT'));
        await dispatch(login(token));
        history.push('/');
      } catch(e) {
        console.error(e);
      }
    }
  }, [sudo]);

  const { history } = useRouter();
  const dispatch = useDispatch();
  const { user } = useMappedState(({ user }) => ({ user }));

  return <BasicLayout>
    <Typography variant="h3" className={cls.pageTitle}>系统设置</Typography>
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h5">sudo -iu</Typography>
        <TextField
          label="UID"
          value={sudo}
          onChange={changeSudo}
          onKeyDown={detectSudo}
          fullWidth
          margin="normal"
        />
      </CardContent>
    </Card>
  </BasicLayout>;
});
