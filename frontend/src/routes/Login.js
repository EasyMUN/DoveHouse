import React, { useState } from 'react';

import { makeStyles } from '@material-ui/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

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

  return <Card className={cls.card}>
    <CardContent>
      <Typography gutterButtom variant="h5" component="h2">
        您先登陆呗
      </Typography>
      <TextField
        label="电子信箱"
        value={email}
        onChange={ev => setEmail(ev.target.value)}
        margin="normal"
        fullWidth
      />

      <TextField
        label="秘密暗码"
        value={pass}
        onChange={ev => setPass(ev.target.value)}
        type="password"
        margin="normal"
        fullWidth
      />
    </CardContent>
    <CardActions>
      <Button color="secondary">得嘞</Button>
      <Button>俺没号</Button>
    </CardActions>
  </Card>;
});

export default Login;
