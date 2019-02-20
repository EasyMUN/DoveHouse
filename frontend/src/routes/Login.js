import React, { useState } from 'react';

import { makeStyles } from '@material-ui/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import { useRouter } from '../Router';

const styles = makeStyles(theme => ({
  card: {
    maxWidth: 400,
    margin: 'auto',
  },
}));

const Login = React.memo(() => {
  const cls = styles();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [realname, setRealname] = useState('');

  const { match, history } = useRouter();

  const reg = match.params.action === 'register';
  let toggle = <Button onClick={() => history.push('/register')}>俺没号</Button>;
  if(reg)
    toggle = <Button onClick={() => history.push('/login')}>俺有号</Button>;

  return <Card className={cls.card}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        { reg ? '给俺来个号' : '您先登陆呗' }
      </Typography>
      <TextField
        label="电子信箱"
        value={email}
        onChange={ev => setEmail(ev.target.value)}
        margin="dense"
        fullWidth
      />

      <TextField
        label="秘密暗码"
        value={pass}
        onChange={ev => setPass(ev.target.value)}
        type="password"
        margin="dense"
        fullWidth
      />

      { reg ?  <TextField
        label="高姓大名"
        value={realname}
        onChange={ev => setRealname(ev.target.value)}
        margin="dense"
        fullWidth
      /> : null }
    </CardContent>
    <CardActions>
      <Button color="secondary">得嘞</Button>
      { toggle }
    </CardActions>
  </Card>;
});

export default Login;
