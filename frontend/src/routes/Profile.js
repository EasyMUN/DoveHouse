import React, { useState, useCallback } from 'react';

import { makeStyles } from '@material-ui/styles';

import { useDispatch, useMappedState } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Card from '@material-ui/core/Card';
import CardActions from '../overrides/CardActions';
import CardContent from '../overrides/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { post, refresh } from '../store/actions';

import UserAvatar from '../comps/UserAvatar';

import { useSnackbar } from '../Snackbar';

import BasicLayout from '../layout/Basic';

const styles = makeStyles(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 4 * theme.spacing.unit,
  },

  avatar: {
    position: 'relative',
    borderRadius: '50%',
    boxShadow: 'rgba(0,0,0,.3) 0 2px 6px',
    marginRight: 30,
    overflow: 'hidden',
  },

  avatarMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    background: 'rgba(0,0,0,.3)',
    color: 'rgba(255,255,255,.6)',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '& .material-icons': {
      fontSize: '40px',
    },

    borderRadius: '50%',

    opacity: 0,
    transition: 'opacity .2s ease-in',

    '&:hover': {
      opacity: 1,
      transition: 'opacity .2s ease-out',
    },
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
    marginBottom: theme.spacing.unit,
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

  const [profile, setProfile] = useState(user.profile || {
    school: null,
    grade: null,
    phone: null,
    qq: null,
    wechat: null,
  });

  const doUpdate = useCallback(async () => {
    await dispatch(post(`/user/${user._id}/profile`, { profile }));

    await dispatch(refresh());

    enqueueSnackbar('更新成功!', {
      variant: 'success',
    });
  }, [profile]);

  const setSchool = useCallback(ev => setProfile({ ...profile, school: ev.target.value }));
  const setGrade = useCallback(ev => setProfile({ ...profile, grade: ev.target.value }));
  const setPhone = useCallback(ev => setProfile({ ...profile, phone: ev.target.value }));
  const setQQ = useCallback(ev => setProfile({ ...profile, qq: ev.target.value }));
  const setWechat = useCallback(ev => setProfile({ ...profile, wechat : ev.target.value }));

  const updateDisabled = !profile.school || !profile.grade || !profile.phone || !profile.qq;
  const verifyDisabled = !id || !(realname === null ? user.realname : realname);

  return <BasicLayout>
    <div className={cls.header}>
      <div className={cls.avatar}>
        <UserAvatar email={user.email} name={user.realname} size={160} />
        <a className={cls.avatarMask} href="https://cn.gravatar.com/" target="_blank" rel="noopener noreferrer">
          <Icon>camera_alt</Icon>
        </a>
      </div>
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
          margin="normal"
          value={profile.school}
          onChange={setSchool}
          fullWidth
          required
        />

        <TextField
          label="所在年级"
          margin="normal"
          value={profile.grade}
          onChange={setGrade}
          fullWidth
          required
        />

        <TextField
          label="手机号"
          margin="normal"
          value={profile.phone}
          onChange={setPhone}
          fullWidth
          required
        />

        <TextField
          label="QQ"
          margin="normal"
          value={profile.qq}
          onChange={setQQ}
          fullWidth
          required
        />

        <TextField
          label="微信"
          margin="normal"
          value={profile.wechat}
          onChange={setWechat}
          fullWidth
        />
      </CardContent>
      <CardActions>
        <Button color="secondary" onClick={doUpdate} disabled={updateDisabled}>
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

            <Typography className={cls.hint}>
              我们将会从您的身份证中获取您的<strong>生日</strong>以及<strong>性别</strong>。如果您使用的身份证件不是身份证，或者存在身份证无法准确体现您的生日、性别等情况，请联系我们。
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
            <Button color="secondary" onClick={doVerify} disabled={verifyDisabled}>
              提交
            </Button>
          </CardActions>
        </Card>
    }
  </BasicLayout>;
});
