import React, { useState, useCallback, useContext } from 'react';

import { makeStyles } from '@material-ui/styles';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Card from '@material-ui/core/Card';
import CardActions from '../overrides/CardActions';
import CardContent from '../overrides/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { post, refresh } from '../store/actions';

import { gravatar } from '../util';

import { useSnackbar } from '../Snackbar';

import BasicLayout from '../layout/Basic';

const styles = makeStyles(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 4 * theme.spacing.unit,
  },

  avatar: {
    width: 160,
    height: 160,
    boxShadow: 'rgba(0,0,0,.3) 0 2px 6px',

    marginRight: 30,
  },

  info: {
    flex: 1,
  },

  realname: {
    marginBottom: theme.spacing.unit,
  },

  status: {
    '& > *': {
      color: 'rgba(0,0,0,.54)',
      lineHeight: '20px',
    },

    display: 'flex',
    alignItems: 'center',

    '& .material-icons': {
      marginRight: theme.spacing.unit,
    },
  },

  card: {
    marginBottom: 2 * theme.spacing.unit,
  },

  hint: {
    marginBottom: 2 * theme.spacing.unit,
    color: 'rgba(0,0,0,.38)',
  },
}));

export default React.memo(() => {
  const cls = styles();

  const mapS2P = useCallback(({ user })=> ({ user }));
  const { user } = useMappedState(mapS2P);
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const [realname, setRealname] = useState(null);
  const [id, setID] = useState('');
  const changeRealname = useCallback(ev => setRealname(ev.target.value), [setRealname])
  const changeID = useCallback(ev => setID(ev.target.value), [setID])

  const doVerify = useCallback(async () => {
    try {
      await dispatch(post(`/user/${user._id}/idVerify`, {
        idNumber: id,
        realname: realname === null ? user.realname : realname,
      }));

      await dispatch(refresh());

      enqueueSnackbar('实名认证成功!', {
        variant: 'success',
      });
    } catch(e) {
      if(e.code !== 400) throw e;
      const body = JSON.parse(e.body);

      enqueueSnackbar(`实名认证失败: ${body.err}`, {
        variant: 'error',
      });
    }
  }, [realname, id, user]);

  return <BasicLayout>
    <div className={cls.header}>
      <Avatar src={gravatar(user.email, 160)} className={cls.avatar} />
      <div className={cls.info}>
        <Typography variant="h2" className={cls.realname}>{ user.realname }</Typography>
        { user.profile ? 
            <div className={cls.status}>
              <Icon>done</Icon>
              <Typography variant="h6">已填写个人信息</Typography>
            </div>
            :
            <div className={cls.status}>
              <Icon>close</Icon>
              <Typography variant="h6">未填写个人信息</Typography>
            </div>
        }
        { user.idNumber ? 
            <div className={cls.status}>
              <Icon>done</Icon>
              <Typography variant="h6">实名认证完成</Typography>
            </div>
            :
            <div className={cls.status}>
              <Icon>close</Icon>
              <Typography variant="h6">未实名认证</Typography>
            </div>
        }
      </div>
    </div>

    <Card className={cls.card}>
      <CardContent>
        <Typography gutterBottom variant="h5" className={cls.type}>个人信息</Typography>

        <TextField
          label="学校"
          margin="dense"
          fullWidth
          required
        />

        <TextField
          label="所在年级"
          margin="dense"
          fullWidth
          required
        />

        <TextField
          label="性别"
          margin="dense"
          fullWidth
          required
        />

        <TextField
          label="手机号"
          margin="dense"
          fullWidth
        />

        <TextField
          label="QQ"
          margin="dense"
          fullWidth
        />

        <TextField
          label="微信"
          margin="dense"
          fullWidth
        />
      </CardContent>
      <CardActions>
        <Button color="secondary">
          更新
        </Button>
      </CardActions>
    </Card>

    { user.idNumber ? null :
        <Card className={cls.card}>
          <CardContent>
            <Typography gutterBottom variant="h5" className={cls.type}>实名认证</Typography>

            <Typography className={cls.hint}>
              请注意，实名认证无法撤销，并且在实名认证之后，您将无法修改真实姓名。
            </Typography>

            <TextField
              label="真实姓名"
              value={realname === null ? user.realname : realname}
              onChange={changeRealname}
              margin="dense"
              fullWidth
            />

            <TextField
              label="身份证号"
              value={id}
              onChange={changeID}
              margin="dense"
              fullWidth
            />
          </CardContent>
          <CardActions>
            <Button color="secondary" onClick={doVerify}>
              提交
            </Button>
          </CardActions>
        </Card>
    }
  </BasicLayout>;
});
