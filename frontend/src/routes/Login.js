import React, { useState, useCallback } from 'react';

import { makeStyles } from '@material-ui/styles';

import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import CardContent from '../overrides/CardContent';
import CardActions from '../overrides/CardActions';

import { useRouter } from '../Router';

import { useDispatch } from 'redux-react-hook';
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
    position: 'absolute',
    top: 0,
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

  const forgotCB = useCallback(async () => {
    try {
      await dispatch(post('/user/pass', { email }));
    } catch(e) {}
    enqueueSnackbar('密码重置链接已发往指定的邮箱！', {
      variant: 'success',
    });
  }, [email]);

  const submit = reg ? registerCB : loginCB;

  const keydownCheck = useCallback(ev => {
    if(ev.key === 'Enter')
      submit();
  });

  let toggle = <Button onClick={() => history.push('/register')}>注册</Button>;
  if(reg)
    toggle = <Button onClick={() => history.push('/login')}>登陆</Button>;

  return <div className={cls.wrapper}>
    <div className={cls.background}/>
    <div className={cls.container}>
      <Card className={cls.card}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            { reg ? '创建新账号' : '登陆' }
          </Typography>
          <TextField
            label="邮箱"
            value={email}
            onChange={setEmailCB}
            margin="dense"
            fullWidth
          />

          <TextField
            label="密码"
            value={pass}
            onChange={setPassCB}
            onKeyDown={keydownCheck}
            type="password"
            margin="dense"
            fullWidth
          />

          { reg ?  <TextField
            label="您的姓名"
            value={realname}
            onChange={setRealnameCB}
            margin="dense"
            fullWidth
          /> : null }
        </CardContent>
        <CardActions>
          <Button color="secondary" onClick={submit}>提交</Button>
          { toggle }
          { reg ? null : <Button onClick={forgotCB} disabled={!email}>找回密码</Button> }
        </CardActions>
      </Card>
    </div>
  </div>;
});

export default Login;
