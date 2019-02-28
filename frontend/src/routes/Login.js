import React, { useState, useCallback, useContext } from 'react';

import { makeStyles } from '@material-ui/styles';

import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import CardContent from '../overrides/CardContent';
import CardActions from '../overrides/CardActions';

import { useRouter } from '../Router';

import { useDispatch, useMappedState } from 'redux-react-hook';
import { post, login } from '../store/actions';

import { useSnackbar } from '../Snackbar';

import BG from '../assets/login-bg.jpg';

const styles = makeStyles(theme => ({
  card: {
    maxWidth: 350,
    margin: 'auto',
  },

  wrapper: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },

  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  background: {
    backgroundImage: `url(${BG})`,
    backgroundSize: 'cover',
    backgroundPosition: '30% center',
    position: 'absolute',
    left: -4,
    right: -4,
    top: -4,
    bottom: -4,
    filter: 'blur(4px) grayscale(0.6)',
  },
}));

const Login = React.memo(() => {
  const cls = styles();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [realname, setRealname] = useState('');

  const setEmailCB = useCallback(ev => setEmail(ev.target.value));
  const setPassCB = useCallback(ev => setPass(ev.target.value));
  const setRealnameCB = useCallback(ev => setRealname(ev.target.value));

  const { match, history } = useRouter();
  const reg = match.params.action === 'register';

  const { enqueueSnackbar } = useSnackbar();

  // Networking
  const dispatch = useDispatch();
  const registerCB = useCallback(async () => {
    try {
      const { token } = await dispatch(post('/user', {
        email,
        pass,
        realname,
      }));

      await dispatch(login(token));

      enqueueSnackbar('注册成功! 我们已把确认邮件发至您的邮箱', {
        variant: 'success',
      });

      history.push('/');
    } catch(e) {
      const payload = JSON.parse(e.body);

      if(payload.err === 'duplicated') {
        enqueueSnackbar('已有相同邮箱的账号!', {
          variant: 'error',
        });
      } else
        throw e;
    }
  }, [email, pass, realname, history]);

  const loginCB = useCallback(async () => {
    try {
      const { token } = await dispatch(post('/login', {
        email,
        pass,
      }));

      await dispatch(login(token));

      history.push('/');
    } catch(e) {
      enqueueSnackbar('邮箱或密码错误!', {
        variant: 'error',
      });
    }
  }, [email, pass, realname]);

  const submit = reg ? registerCB : loginCB;

  let toggle = <Button onClick={() => history.push('/register')}>俺没号</Button>;
  if(reg)
    toggle = <Button onClick={() => history.push('/login')}>俺有号</Button>;

  return <div className={cls.wrapper}>
    <div className={cls.background}/>
    <div className={cls.container}>
      <Card className={cls.card}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            { reg ? '给俺整个号' : '请您登陆' }
          </Typography>
          <TextField
            label="电子信箱"
            value={email}
            onChange={setEmailCB}
            margin="dense"
            fullWidth
          />

          <TextField
            label="秘密暗码"
            value={pass}
            onChange={setPassCB}
            type="password"
            margin="dense"
            fullWidth
          />

          { reg ?  <TextField
            label="高姓大名"
            value={realname}
            onChange={setRealnameCB}
            margin="dense"
            fullWidth
          /> : null }
        </CardContent>
        <CardActions>
          <Button color="secondary" onClick={submit}>得嘞</Button>
          { toggle }
        </CardActions>
      </Card>
    </div>
  </div>;
});

export default Login;
