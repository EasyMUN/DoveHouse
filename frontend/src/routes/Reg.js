import React, { useMemo, useEffect, useState, useCallback } from 'react';

import clsx from 'clsx';

import { useRouter } from '../Router';

import { makeStyles } from '@material-ui/styles';

import { useDispatch } from 'redux-react-hook';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '../overrides/CardContent';
import CardActions from '../overrides/CardActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Loading from '../comps/Loading';
import UserAvatar from '../comps/UserAvatar';

import BasicLayout from '../layout/Basic';

import { NavLink } from 'react-router-dom';
import { get, post, fetchConf, fetchComms } from '../store/actions';
import { debounceEv } from '../util';

import { RegDetailDialog } from './Conference';
import { TagEditDialog } from './RegList';

const styles = makeStyles(theme => ({
  logo: {
    height: 18,
    width: 18,
    marginRight: theme.spacing.unit,
  },

  abbr: {
    marginBottom: 0,
    color: 'rgba(0,0,0,.38)',
  },

  abbrLine: {
    display: 'flex',
    alignItems: 'center',
  },

  pageTitle: {
    marginTop: theme.spacing.unit,
    color: 'rgba(0,0,0,.54)',
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },

  avatar: {
    boxShadow: 'rgba(0,0,0,.3) 0 2px 6px',
    marginTop: 40,
    marginBottom: 20,
  },

  emptyTags: {
    fontStyle: 'italic',
  },

  extraContent: {
    padding: 20,
    paddingBottom: 20,
  },

  extraCard: {
    marginTop: 20,
  },

  syncInd: {
    fontSize: 14,
    color: 'rgba(0,0,0,.38)',
    width: '100%',
    marginTop: theme.spacing.unit,

    opacity: 0,
    transition: 'opacity .2s ease-in',
  },

  syncIndShown: {
    opacity: 1,
    transition: 'opacity .2s ease-out',
  },
}));

function generateTagNode(tags, cls) {
  if(!tags || tags.length === 0) return <span className={cls.emptyTags}>无标签</span>;
  return <span className={cls.tags}>{ tags.join(', ') }</span>;
}

export default () => {
  const cls = styles();

  const { match } = useRouter();

  const [reg, setReg] = useState(null);
  const [comms, setComms] = useState(null);
  const [conf, setConf] = useState(null);

  const [regDetailOpen, setRegDetailOpen] = useState(false);
  const closeRegDetail = useCallback(() => setRegDetailOpen(false), [setRegDetailOpen]);
  const openRegDetail = useCallback(() => setRegDetailOpen(true), [setRegDetailOpen]);

  const dispatch = useDispatch();

  async function updateReg() {
    const reg = await dispatch(get(`/conference/${match.params.id}/list/${match.params.user}`));
    setReg(reg);
  }

  async function updateConf() {
    const conf = await dispatch(fetchConf(match.params.id, true));
    setConf(conf);
  };

  async function updateComms() {
    const conf = await dispatch(fetchComms(match.params.id, true));
    setComms(conf);
  };

  useEffect(() => {
    updateConf();
    updateComms();
    updateReg();
  }, [match.params.id, dispatch]);

  const [editing, setEditing] = useState(false);
  const [syncingExtra, setSyncingExtra] = useState(false);
  const closeTagEdit = useCallback(() => setEditing(false));

  const [editTag, setEditTag] = useState(null);
  const openTagEdit = useCallback(() => {
    setEditTag(reg.tags);
    setEditing(true);
  }, [reg]);

  const submitTag = useCallback(async () => {
    await dispatch(post(`/conference/${match.params.id}/list/${match.params.user}/tags`, editTag, 'PUT'));
    await updateReg();
    closeTagEdit();
  }, [editTag, match]);

  const syncExtra = useMemo(() => debounceEv(async ev => {
    setSyncingExtra(true);
    await dispatch(post(`/conference/${match.params.id}/list/${match.params.user}/extra`, { extra: ev.target.value }, 'PUT'));
    setSyncingExtra(false);
  }, 1000), [setSyncingExtra]);

  if(!reg || !conf) return <BasicLayout>
    <Loading />
  </BasicLayout>;

  return <BasicLayout>
    <Card>
      <CardContent className={cls.title}>
        <NavLink className={cls.abbrLine} to={`/conference/${match.params.id}`}>
          <Avatar src={conf.logo} className={cls.logo}/>
          <Typography variant="body2" className={cls.abbr}>{ conf.abbr }</Typography>
        </NavLink>

        <UserAvatar email={reg.user.email} name={reg.user.realname} size={120} className={cls.avatar} />
        <Typography variant="h4" className={cls.name}>{ reg.user.realname }</Typography>

        <List className={cls.info}>
          <ListItem>
            <ListItemIcon><Icon>email</Icon></ListItemIcon>
            <ListItemText primary={reg.user.email} />
          </ListItem>
          <ListItem>
            <ListItemIcon><Icon>phone</Icon></ListItemIcon>
            <ListItemText primary={reg.user.profile.phone} />
          </ListItem>
          <ListItem>
            <ListItemIcon><Icon>school</Icon></ListItemIcon>
            <ListItemText primary={reg.user.profile.school} />
          </ListItem>
          <ListItem>
            <ListItemIcon><Icon>message</Icon></ListItemIcon>
            <ListItemText primary={reg.user.profile.qq} secondary="QQ" />
          </ListItem>
          { reg.user.profile.wechat ?
              <ListItem>
                <ListItemIcon><Icon>message</Icon></ListItemIcon>
                <ListItemText primary={reg.user.profile.wechat} secondary="WeChat" />
              </ListItem> : null }
          <ListItem button onClick={openTagEdit}>
            <ListItemIcon><Icon>label</Icon></ListItemIcon>
            <ListItemText primary={generateTagNode(reg.tags, cls)} />
          </ListItem>
        </List>
      </CardContent>
      <CardActions>
        <Button onClick={openRegDetail}>志愿详情</Button>
      </CardActions>
    </Card>

    <Card className={cls.extraCard}>
      <CardContent className={cls.extraContent}>
        <TextField
          multiline
          fullWidth
          variant="outlined"
          label="备注"
          className={cls.extra}
          defaultValue={reg.extra}
          onChange={syncExtra}
        />
      </CardContent>
    </Card>

    <div className={clsx(cls.syncInd, syncingExtra ? cls.syncIndShown : null)}>同步中...</div>

    <RegDetailDialog
      comms={comms || []}

      open={regDetailOpen}
      onClose={closeRegDetail}
      fullWidth

      value={reg.reg}
    />

    <TagEditDialog
      value={editTag}
      onChange={setEditTag}

      open={editing}
      onClose={closeTagEdit}

      onSubmit={submitTag}
    />
  </BasicLayout>
}
